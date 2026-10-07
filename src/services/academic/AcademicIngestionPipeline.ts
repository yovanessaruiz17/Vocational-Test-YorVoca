import {
  deduplicateInstitutions,
  deduplicatePrograms,
  normalizeInstitutionDeduplicationName,
} from '../../lib/academic';
import {
  AcademicConflict,
  AcademicProgram,
  AcademicSourceRecord,
  CareerProgramMapping,
  Institution,
  ProgramOfficialContent,
} from '../../types/academic';
import {
  AcademicIngestionRun,
  IngestionPipelineInput,
  IngestionPipelineResult,
} from '../../types/ingestion';
import { InstitutionWebsiteAdapter } from '../institutions/InstitutionWebsiteAdapter';
import {
  normalizeRawSniesInstitution,
  normalizeRawSniesProgram,
} from '../snies/SniesNormalizer';
import {
  validateSniesInstitution,
  validateSniesProgram,
} from '../snies/SniesValidator';

/**
 * Pipeline determinista de ingestión académica (Sección 28):
 *
 * SOURCE
 *   ↓
 * RAW DATA
 *   ↓
 * NORMALIZATION
 *   ↓
 * VALIDATION
 *   ↓
 * DEDUPLICATION
 *   ↓
 * SOURCE LINKING
 *   ↓
 * CONFLICT DETECTION
 *   ↓
 * UPSERT
 *   ↓
 * VERIFICATION STATUS
 */
export function runAcademicIngestionPipeline(
  input: IngestionPipelineInput
): IngestionPipelineResult {
  const startedAt = new Date().toISOString();
  const referenceDateIso = input.referenceDateIso ?? startedAt;
  const errors: string[] = [];

  let recordsFound =
    input.institutions.length +
    input.programs.length +
    (input.officialContents?.length ?? 0);
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsSkipped = 0;
  let recordsFailed = 0;

  const sourcesMap = new Map<string, AcademicSourceRecord>();
  const normalizedInstitutions: Institution[] = [];

  // 1. NORMALIZATION + VALIDATION de Instituciones (Fuente A: SNIES / MEN Open Data)
  for (const rawInst of input.institutions) {
    const { institution, sourceRecord } = normalizeRawSniesInstitution(
      rawInst,
      referenceDateIso
    );
    const validation = validateSniesInstitution(institution, sourceRecord);

    if (!validation.isValid || !validation.institution) {
      recordsFailed++;
      errors.push(...validation.errors);
      continue;
    }

    normalizedInstitutions.push(validation.institution);
    sourcesMap.set(sourceRecord.sourceId, sourceRecord);
  }

  // 2. DEDUPLICATION de Instituciones
  const dedupedInstResult = deduplicateInstitutions(normalizedInstitutions);
  recordsSkipped += dedupedInstResult.duplicatesMerged;

  const institutionsById: Record<string, Institution> = {};
  const institutionsBySniesCode: Record<string, Institution> = {};
  const institutionsByNormName: Record<string, Institution> = {};

  for (const inst of dedupedInstResult.institutions) {
    institutionsById[inst.institutionId] = inst;
    if (inst.sniesInstitutionCode) {
      institutionsBySniesCode[inst.sniesInstitutionCode] = inst;
    }
    const normName = normalizeInstitutionDeduplicationName(
      inst.officialName ?? inst.name
    );
    institutionsByNormName[normName] = inst;
  }

  // 3. NORMALIZATION + VALIDATION de Programas (Fuente A: SNIES / MEN Open Data)
  const normalizedPrograms: AcademicProgram[] = [];
  for (const rawProg of input.programs) {
    let targetInst: Institution | undefined;
    if (rawProg.sniesInstitutionCode) {
      targetInst = institutionsBySniesCode[rawProg.sniesInstitutionCode.trim()];
    }
    if (!targetInst && rawProg.institutionOfficialName) {
      const normName = normalizeInstitutionDeduplicationName(
        rawProg.institutionOfficialName
      );
      targetInst = institutionsByNormName[normName];
    }

    const resolvedInstId = targetInst
      ? targetInst.institutionId
      : rawProg.sniesInstitutionCode
      ? `snies_inst_${rawProg.sniesInstitutionCode.trim()}`
      : 'unknown_inst';

    const { program, sourceRecord } = normalizeRawSniesProgram(
      rawProg,
      resolvedInstId,
      referenceDateIso
    );

    const validation = validateSniesProgram(program, targetInst, sourceRecord);
    if (!validation.isValid || !validation.program) {
      recordsFailed++;
      errors.push(...validation.errors);
      continue;
    }

    normalizedPrograms.push(validation.program);
    sourcesMap.set(sourceRecord.sourceId, sourceRecord);
  }

  // 4. DEDUPLICATION de Programas
  const dedupedProgResult = deduplicatePrograms(
    normalizedPrograms,
    institutionsById
  );
  recordsSkipped += dedupedProgResult.duplicatesMerged;

  const programsById = new Map<string, AcademicProgram>();
  const programsBySniesCode = new Map<string, AcademicProgram>();

  for (const prog of dedupedProgResult.programs) {
    programsById.set(prog.programId, prog);
    if (prog.sniesCode) {
      programsBySniesCode.set(prog.sniesCode, prog);
    }
  }

  // 5. SOURCE LINKING + CONFLICT DETECTION con Sitios Web Institucionales (Fuente B)
  const websiteAdapter = new InstitutionWebsiteAdapter();
  const officialContents: ProgramOfficialContent[] = [];
  const allConflicts: AcademicConflict[] = [];

  for (const rawWeb of input.officialContents ?? []) {
    const targetProg = rawWeb.sniesProgramCode
      ? programsBySniesCode.get(rawWeb.sniesProgramCode.trim())
      : rawWeb.programId
      ? programsById.get(rawWeb.programId)
      : undefined;

    if (!targetProg) {
      recordsSkipped++;
      continue;
    }

    const targetInst = institutionsById[targetProg.institutionId];
    if (!targetInst) {
      recordsSkipped++;
      continue;
    }

    const enrichment = websiteAdapter.enrichProgramWithOfficialWebsite({
      sniesProgram: targetProg,
      institution: targetInst,
      websiteInput: rawWeb,
      referenceDateIso,
    });

    if (!enrichment.accepted) {
      recordsFailed++;
      if (enrichment.rejectionReason) {
        errors.push(enrichment.rejectionReason);
      }
      continue;
    }

    programsById.set(targetProg.programId, enrichment.program);
    if (enrichment.program.sniesCode) {
      programsBySniesCode.set(enrichment.program.sniesCode, enrichment.program);
    }
    if (enrichment.officialContent) {
      officialContents.push(enrichment.officialContent);
    }
    if (enrichment.sourceRecord) {
      sourcesMap.set(enrichment.sourceRecord.sourceId, enrichment.sourceRecord);
    }
    if (enrichment.conflicts.length > 0) {
      allConflicts.push(...enrichment.conflicts);
    }
    recordsUpdated++;
  }

  const finalInstitutions = Object.values(institutionsById);
  const finalPrograms = Array.from(programsById.values());
  recordsCreated = finalInstitutions.length + finalPrograms.length;

  const finishedAt = new Date().toISOString();
  const run: AcademicIngestionRun = {
    id: `ing_run_${Date.now()}`,
    sourceType: 'snies',
    startedAt,
    finishedAt,
    status: errors.length > 0 ? 'completed_with_warnings' : 'completed',
    recordsFound,
    recordsCreated,
    recordsUpdated,
    recordsSkipped,
    recordsFailed,
    conflictsDetected: allConflicts.length,
    errorSummary: errors.length > 0 ? errors : undefined,
  };

  return {
    run,
    institutions: finalInstitutions,
    programs: finalPrograms,
    sources: Array.from(sourcesMap.values()),
    officialContents,
    conflicts: allConflicts,
    careerMappings: input.careerMappings ?? [],
  };
}
