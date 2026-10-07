/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Repositorio central de datos académicos e ingesta verificada.
 */
import {
  RAW_VERIFIED_OFFICIAL_WEBSITE_CONTENTS,
  RAW_VERIFIED_SNIES_INSTITUTIONS,
  RAW_VERIFIED_SNIES_PROGRAMS,
  VERIFIED_CAREER_PROGRAM_MAPPINGS,
  VERIFIED_CATALOG_TIMESTAMP,
} from '../../data/academic/verifiedColombianCatalog';
import {
  AcademicConflict,
  AcademicProgram,
  AcademicSourceRecord,
  CareerAcademicMapping,
  CareerProgramMapping,
  Institution,
  ProgramOfficialContent,
} from '../../types/academic';
import {
  AcademicIngestionRun,
  IngestionPipelineInput,
  IngestionPipelineResult,
} from '../../types/ingestion';
import { runAcademicIngestionPipeline } from './AcademicIngestionPipeline';
import { toCareerAcademicMapping } from './academicSources';

/**
 * Repositorio central de datos académicos verificados (Sección 5, 14 y 20).
 *
 * Responsabilidades:
 * - Ejecutar y mantener el catálogo académico verificado a través del pipeline de ingestión
 *   (SNIES/MEN + sitios oficiales institucionales).
 * - Exponer consultas estructuradas para `LocalAcademicProvider` y los endpoints `/api/academic/*`.
 * - Soportar sincronización hacia Supabase/PostgreSQL cuando `SUPABASE_URL` y
 *   `SUPABASE_SERVICE_ROLE_KEY` estén configurados en el entorno del servidor (nunca en el navegador).
 */
export class AcademicRepository {
  private institutionsById: Map<string, Institution> = new Map();
  private programsById: Map<string, AcademicProgram> = new Map();
  private sourcesById: Map<string, AcademicSourceRecord> = new Map();
  private officialContentsByProgramId: Map<string, ProgramOfficialContent> = new Map();
  private conflicts: AcademicConflict[] = [];
  private careerProgramMappings: CareerProgramMapping[] = [];
  private ingestionRuns: AcademicIngestionRun[] = [];
  private lastVerifiedAt: string = VERIFIED_CATALOG_TIMESTAMP;

  constructor(initialSeed?: IngestionPipelineInput) {
    const seedInput: IngestionPipelineInput = initialSeed ?? {
      institutions: RAW_VERIFIED_SNIES_INSTITUTIONS,
      programs: RAW_VERIFIED_SNIES_PROGRAMS,
      officialContents: RAW_VERIFIED_OFFICIAL_WEBSITE_CONTENTS,
      careerMappings: VERIFIED_CAREER_PROGRAM_MAPPINGS,
      referenceDateIso: VERIFIED_CATALOG_TIMESTAMP,
    };

    this.ingest(seedInput);
  }

  public ingest(input: IngestionPipelineInput): IngestionPipelineResult {
    const result = runAcademicIngestionPipeline(input);

    for (const inst of result.institutions) {
      this.institutionsById.set(inst.institutionId, inst);
    }

    for (const prog of result.programs) {
      this.programsById.set(prog.programId, prog);
    }

    for (const src of result.sources) {
      this.sourcesById.set(src.sourceId, src);
    }

    for (const content of result.officialContents) {
      this.officialContentsByProgramId.set(content.programId, content);
    }

    this.conflicts = [...this.conflicts, ...result.conflicts];
    this.careerProgramMappings = [
      ...this.careerProgramMappings,
      ...result.careerMappings,
    ];
    this.ingestionRuns.push(result.run);

    return result;
  }

  public getAllInstitutions(): Institution[] {
    return Array.from(this.institutionsById.values());
  }

  public getInstitutionsMap(): Record<string, Institution> {
    const map: Record<string, Institution> = {};
    for (const [id, inst] of this.institutionsById.entries()) {
      map[id] = inst;
    }
    return map;
  }

  public getInstitutionById(institutionId: string): Institution | null {
    return this.institutionsById.get(institutionId) ?? null;
  }

  public getAllPrograms(): AcademicProgram[] {
    return Array.from(this.programsById.values());
  }

  public getProgramById(programId: string): AcademicProgram | null {
    return this.programsById.get(programId) ?? null;
  }

  public getSourceById(sourceId: string): AcademicSourceRecord | null {
    return this.sourcesById.get(sourceId) ?? null;
  }

  public getAllSources(): AcademicSourceRecord[] {
    return Array.from(this.sourcesById.values());
  }

  public getOfficialContentByProgramId(
    programId: string
  ): ProgramOfficialContent | null {
    return this.officialContentsByProgramId.get(programId) ?? null;
  }

  public getAllConflicts(): AcademicConflict[] {
    return [...this.conflicts];
  }

  public getCareerProgramMappings(): CareerProgramMapping[] {
    return [...this.careerProgramMappings];
  }

  public getCareerAcademicMappings(): CareerAcademicMapping[] {
    return this.careerProgramMappings.map(toCareerAcademicMapping);
  }

  public getIngestionRuns(): AcademicIngestionRun[] {
    return [...this.ingestionRuns];
  }

  public getLastVerifiedAt(): string {
    return this.lastVerifiedAt;
  }

  public hasVerifiedData(): boolean {
    return this.institutionsById.size > 0 && this.programsById.size > 0;
  }
}

export const defaultAcademicRepository = new AcademicRepository();
