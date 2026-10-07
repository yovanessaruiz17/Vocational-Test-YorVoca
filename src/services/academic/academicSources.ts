import {
  AcademicSourceRecord,
  CareerAcademicMapping,
  CareerProgramMapping,
} from '../../types/academic';

/**
 * Convierte un `CareerProgramMapping` (F6A) al contrato `CareerAcademicMapping` (F5)
 * preservando la compatibilidad total con `matchCareerToProgram`.
 */
export function toCareerAcademicMapping(
  mapping: CareerProgramMapping
): CareerAcademicMapping {
  const matchType = mapping.matchType === 'direct_match' ? 'direct' : 'related';
  const relevance =
    mapping.confidence >= 0.9
      ? 'high'
      : mapping.confidence >= 0.65
      ? 'medium'
      : 'low';

  return {
    careerId: mapping.careerId,
    programId: mapping.programId,
    matchType,
    relevance,
    rationale: mapping.reason,
  };
}

export function indexSourcesById(
  sources: AcademicSourceRecord[]
): Record<string, AcademicSourceRecord> {
  const map: Record<string, AcademicSourceRecord> = {};
  for (const s of sources) {
    map[s.sourceId] = s;
  }
  return map;
}
