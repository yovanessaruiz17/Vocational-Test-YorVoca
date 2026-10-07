import {
  AcademicConflict,
  AcademicModality,
  AcademicProgram,
  AcademicProgramStatus,
} from '../../types/academic';
import { RawOfficialWebsiteProgramInput } from '../../types/ingestion';
import { normalizeAcademicText } from './academicMatcher';
import { normalizeProgramDeduplicationName } from './deduplicatePrograms';

export function parseModalityFromText(raw?: string): AcademicModality | null {
  if (!raw || !raw.trim()) return null;
  const norm = normalizeAcademicText(raw);
  if (norm.includes('virtual')) return 'virtual';
  if (
    norm.includes('hibrid') ||
    norm.includes('distancia') ||
    norm.includes('combinad') ||
    norm.includes('dual')
  ) {
    return 'hybrid';
  }
  if (norm.includes('presencial')) return 'presential';
  return null;
}

export function parseStatusFromText(raw?: string): AcademicProgramStatus | null {
  if (!raw || !raw.trim()) return null;
  const norm = normalizeAcademicText(raw);
  if (norm === 'activo' || norm === 'active') return 'active';
  if (norm === 'inactivo' || norm === 'inactive') return 'inactive';
  return null;
}

/**
 * Detecta contradicciones entre el registro oficial regulatorio (SNIES/MEN)
 * y la información publicada en el sitio web oficial de la institución (Sección 16 y 17).
 *
 * Ejemplos de conflictos detectados:
 * - modalidad (ej. SNIES = Presencial vs Universidad = Virtual)
 * - municipio / ciudad de oferta
 * - estado del programa
 * - denominación del programa
 *
 * REGLA FUNDAMENTAL: No sobrescribe silenciosamente el valor regulatorio de SNIES.
 * Registra cada conflicto con ambos valores y sus fuentes.
 */
export function detectAcademicConflicts(
  sniesProgram: AcademicProgram,
  websiteInput: RawOfficialWebsiteProgramInput,
  detectedAt: string = new Date().toISOString()
): AcademicConflict[] {
  const conflicts: AcademicConflict[] = [];
  const sourceALabel =
    sniesProgram.source.type === 'men_open_data' ? 'men_open_data' : 'snies';
  const sourceBLabel = 'institution_website';

  // 1. Conflicto en modalidad (ej. SNIES dice presencial, sitio web dice virtual)
  const webModality = parseModalityFromText(websiteInput.modalityText);
  if (
    webModality &&
    sniesProgram.modality !== 'unknown' &&
    webModality !== sniesProgram.modality
  ) {
    conflicts.push({
      conflictId: `conflict_${sniesProgram.programId}_modality`,
      institutionId: sniesProgram.institutionId,
      programId: sniesProgram.programId,
      field: 'modality',
      sourceA: sourceALabel,
      valueA: sniesProgram.modality,
      sourceB: sourceBLabel,
      valueB: webModality,
      detectedAt,
      resolved: false,
      resolution:
        'SNIES conserva autoridad regulatoria sobre la modalidad registrada; se conserva también la modalidad comercial reportada por la institución.',
    });
  }

  // 2. Conflicto en municipio / ciudad
  if (websiteInput.municipalityText && websiteInput.municipalityText.trim()) {
    const sniesCityNorm = normalizeAcademicText(
      sniesProgram.municipality ?? sniesProgram.city
    );
    const webCityNorm = normalizeAcademicText(websiteInput.municipalityText);
    if (sniesCityNorm && webCityNorm && sniesCityNorm !== webCityNorm) {
      conflicts.push({
        conflictId: `conflict_${sniesProgram.programId}_municipality`,
        institutionId: sniesProgram.institutionId,
        programId: sniesProgram.programId,
        field: 'municipality',
        sourceA: sourceALabel,
        valueA: sniesProgram.municipality ?? sniesProgram.city,
        sourceB: sourceBLabel,
        valueB: websiteInput.municipalityText.trim(),
        detectedAt,
        resolved: false,
        resolution:
          'SNIES conserva autoridad sobre el municipio oficial registrado de oferta.',
      });
    }
  }

  // 3. Conflicto en estado (activo / inactivo)
  const webStatus = parseStatusFromText(websiteInput.statusText);
  if (
    webStatus &&
    sniesProgram.status !== 'unknown' &&
    webStatus !== sniesProgram.status
  ) {
    conflicts.push({
      conflictId: `conflict_${sniesProgram.programId}_status`,
      institutionId: sniesProgram.institutionId,
      programId: sniesProgram.programId,
      field: 'status',
      sourceA: sourceALabel,
      valueA: sniesProgram.status,
      sourceB: sourceBLabel,
      valueB: webStatus,
      detectedAt,
      resolved: false,
      resolution:
        'SNIES conserva autoridad regulatoria sobre el estado oficial del registro calificado.',
    });
  }

  // 4. Conflicto en nombre / denominación si difiere más allá de abreviaturas normales
  if (websiteInput.commercialProgramName && websiteInput.commercialProgramName.trim()) {
    const sniesNorm = normalizeProgramDeduplicationName(
      sniesProgram.officialName ?? sniesProgram.name
    );
    const webNorm = normalizeProgramDeduplicationName(websiteInput.commercialProgramName);
    if (sniesNorm && webNorm && sniesNorm !== webNorm) {
      conflicts.push({
        conflictId: `conflict_${sniesProgram.programId}_name`,
        institutionId: sniesProgram.institutionId,
        programId: sniesProgram.programId,
        field: 'name',
        sourceA: sourceALabel,
        valueA: sniesProgram.officialName ?? sniesProgram.name,
        sourceB: sourceBLabel,
        valueB: websiteInput.commercialProgramName.trim(),
        detectedAt,
        resolved: false,
        resolution:
          'Se conserva la denominación oficial registrada en SNIES y se registra la denominación comercial del sitio institucional.',
      });
    }
  }

  return conflicts;
}
