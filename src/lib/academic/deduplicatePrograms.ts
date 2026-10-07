import { AcademicProgram, Institution } from '../../types/academic';
import { normalizeAcademicText } from './academicMatcher';

const PROGRAM_ABBREVIATION_EXPANSIONS: Array<[RegExp, string]> = [
  [/\bing\.?\b/g, 'ingenieria'],
  [/\btec\.?\b/g, 'tecnologia'],
  [/\blic\.?\b/g, 'licenciatura'],
  [/\badmon\.?\b/g, 'administracion'],
  [/\badm\.?\b/g, 'administracion'],
  [/\besp\.?\b/g, 'especializacion'],
  [/\bcont\.?\b/g, 'contaduria'],
];

/**
 * Normaliza el nombre de un programa expandiendo abreviaturas frecuentes ("Ing. de Sistemas" -> "ingenieria de sistemas")
 * para evitar duplicados por variaciones ortográficas (Sección 29 y 30).
 */
export function normalizeProgramDeduplicationName(name: string): string {
  const base = normalizeAcademicText(name);
  let expanded = base;
  for (const [pattern, replacement] of PROGRAM_ABBREVIATION_EXPANSIONS) {
    expanded = expanded.replace(pattern, replacement);
  }
  return expanded.replace(/\s+/g, ' ').trim();
}

export function normalizeInstitutionDeduplicationName(name: string): string {
  return normalizeAcademicText(name)
    .replace(/\bfund\b/g, 'fundacion')
    .replace(/\buniv\b/g, 'universidad')
    .replace(/\binst\b/g, 'institucion')
    .replace(/\bcorp\b/g, 'corporacion')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Genera la clave determinista de deduplicación de una institución (Sección 29):
 * 1. Prioridad: código SNIES de la institución (`sniesInstitutionCode` / `sniesCode`)
 * 2. Fallback: nombre institucional normalizado + municipio normalizado
 */
export function buildInstitutionDeduplicationKey(institution: Institution): string {
  const snies = (institution.sniesInstitutionCode ?? institution.sniesCode ?? '').trim();
  if (snies) {
    return `snies_inst:${snies}`;
  }
  const normName = normalizeInstitutionDeduplicationName(
    institution.officialName ?? institution.name
  );
  const normCity = normalizeAcademicText(institution.municipality ?? institution.city);
  return `name_city:${normName}::${normCity}`;
}

/**
 * Genera la clave determinista de deduplicación de un programa académico (Sección 29):
 * 1. Prioridad: código SNIES del programa (`sniesCode`)
 * 2. Fallback: institución normalizada (o ID institucional) + municipio + nombre de programa normalizado
 */
export function buildProgramDeduplicationKey(
  program: AcademicProgram,
  institution?: Institution
): string {
  const snies = (program.sniesCode ?? '').trim();
  if (snies) {
    return `snies_prog:${snies}`;
  }

  const instIdentity = institution
    ? (institution.sniesInstitutionCode ??
        institution.sniesCode ??
        normalizeInstitutionDeduplicationName(institution.officialName ?? institution.name))
    : normalizeAcademicText(program.institutionId);

  const normCity = normalizeAcademicText(program.municipality ?? program.city);
  const normProgram = normalizeProgramDeduplicationName(
    program.officialName ?? program.name
  );

  return `composite:${instIdentity}::${normCity}::${normProgram}`;
}

export interface DeduplicateInstitutionsResult {
  institutions: Institution[];
  duplicatesMerged: number;
  canonicalIdMap: Record<string, string>;
}

/**
 * Deduplica un listado de instituciones priorizando registros con código SNIES y fuente verificada.
 */
export function deduplicateInstitutions(
  institutions: Institution[]
): DeduplicateInstitutionsResult {
  const byKey = new Map<string, Institution>();
  const byNameCity = new Map<string, string>();
  const canonicalIdMap: Record<string, string> = {};
  let duplicatesMerged = 0;

  for (const inst of institutions) {
    const primaryKey = buildInstitutionDeduplicationKey(inst);
    const normName = normalizeInstitutionDeduplicationName(inst.officialName ?? inst.name);
    const normCity = normalizeAcademicText(inst.municipality ?? inst.city);
    const nameCityKey = `${normName}::${normCity}`;

    const matchedKey = byKey.has(primaryKey)
      ? primaryKey
      : byNameCity.get(nameCityKey) ?? primaryKey;

    const existing = byKey.get(matchedKey);
    if (!existing) {
      byKey.set(matchedKey, inst);
      byNameCity.set(nameCityKey, matchedKey);
      canonicalIdMap[inst.institutionId] = inst.institutionId;
    } else {
      duplicatesMerged++;
      // Conservar el registro con código SNIES o fuente más verificada y enriquecer campos faltantes
      const preferNew =
        !existing.sniesCode &&
        Boolean(inst.sniesCode || inst.sniesInstitutionCode) &&
        inst.source.provider !== 'mock';

      const winner = preferNew ? inst : existing;
      const loser = preferNew ? existing : inst;

      const merged: Institution = {
        ...loser,
        ...winner,
        officialWebsite: winner.officialWebsite ?? loser.officialWebsite,
        officialWebsiteUrl: winner.officialWebsiteUrl ?? loser.officialWebsiteUrl,
        officialDomain: winner.officialDomain ?? loser.officialDomain,
        sniesCode: winner.sniesCode ?? loser.sniesCode,
        sniesInstitutionCode:
          winner.sniesInstitutionCode ??
          loser.sniesInstitutionCode ??
          winner.sniesCode ??
          loser.sniesCode,
        accreditation: winner.accreditation ?? loser.accreditation,
      };

      byKey.set(matchedKey, merged);
      byNameCity.set(nameCityKey, matchedKey);
      canonicalIdMap[inst.institutionId] = merged.institutionId;
      canonicalIdMap[existing.institutionId] = merged.institutionId;
    }
  }

  return {
    institutions: Array.from(byKey.values()),
    duplicatesMerged,
    canonicalIdMap,
  };
}

export interface DeduplicateProgramsResult {
  programs: AcademicProgram[];
  duplicatesMerged: number;
}

/**
 * Deduplica programas académicos evitando que variaciones como "Ing. de Sistemas" e
 * "Ingeniería de Sistemas" en la misma institución y ciudad creen duplicados,
 * pero permitiendo que distintas instituciones tengan programas con el mismo nombre (Sección 29 y 36).
 */
export function deduplicatePrograms(
  programs: AcademicProgram[],
  institutionsById: Record<string, Institution> = {}
): DeduplicateProgramsResult {
  const byKey = new Map<string, AcademicProgram>();
  const byCompositeKey = new Map<string, string>();
  let duplicatesMerged = 0;

  for (const prog of programs) {
    const inst = institutionsById[prog.institutionId];
    const primaryKey = buildProgramDeduplicationKey(prog, inst);

    const instIdentity = inst
      ? (inst.sniesInstitutionCode ??
          inst.sniesCode ??
          normalizeInstitutionDeduplicationName(inst.officialName ?? inst.name))
      : normalizeAcademicText(prog.institutionId);
    const normCity = normalizeAcademicText(prog.municipality ?? prog.city);
    const normProg = normalizeProgramDeduplicationName(prog.officialName ?? prog.name);
    const compositeKey = `composite:${instIdentity}::${normCity}::${normProg}`;

    const matchedKey = byKey.has(primaryKey)
      ? primaryKey
      : byCompositeKey.get(compositeKey) ?? primaryKey;

    const existing = byKey.get(matchedKey);
    if (!existing) {
      byKey.set(matchedKey, prog);
      byCompositeKey.set(compositeKey, matchedKey);
    } else {
      duplicatesMerged++;
      const preferNew =
        !existing.sniesCode &&
        Boolean(prog.sniesCode) &&
        prog.source.provider !== 'mock';

      const winner = preferNew ? prog : existing;
      const loser = preferNew ? existing : prog;

      const merged: AcademicProgram = {
        ...loser,
        ...winner,
        sniesCode: winner.sniesCode ?? loser.sniesCode,
        officialUrl: winner.officialUrl ?? loser.officialUrl,
        officialProgramUrl: winner.officialProgramUrl ?? loser.officialProgramUrl,
        officialContent: winner.officialContent ?? loser.officialContent,
        conflicts: [
          ...(existing.conflicts ?? []),
          ...(prog.conflicts ?? []),
        ],
      };

      byKey.set(matchedKey, merged);
      byCompositeKey.set(compositeKey, matchedKey);
    }
  }

  return {
    programs: Array.from(byKey.values()),
    duplicatesMerged,
  };
}
