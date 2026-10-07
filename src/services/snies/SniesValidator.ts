import {
  isOfficialMenSourceUrl,
  isValidSniesCodeFormat,
  validateAcademicProgram,
  validateAcademicSourceRecord,
  validateInstitution,
  verifyOfficialDomain,
} from '../../lib/academic';
import {
  AcademicProgram,
  AcademicSourceRecord,
  Institution,
} from '../../types/academic';

export interface SniesInstitutionValidationResult {
  isValid: boolean;
  institution: Institution | null;
  errors: string[];
}

export interface SniesProgramValidationResult {
  isValid: boolean;
  program: AcademicProgram | null;
  errors: string[];
}

/**
 * Valida estrictamente una institución normalizada proveniente de SNIES / MEN Open Data / Portal Institucional.
 */
export function validateSniesInstitution(
  institution: Institution,
  sourceRecord?: AcademicSourceRecord
): SniesInstitutionValidationResult {
  const errors: string[] = [];

  const baseCheck = validateInstitution(institution);
  if (!baseCheck.isValid || !baseCheck.institution) {
    errors.push(baseCheck.error ?? 'Institución inválida.');
  }

  if (institution.sniesInstitutionCode && !isValidSniesCodeFormat(institution.sniesInstitutionCode)) {
    errors.push(`Código SNIES de institución inválido: "${institution.sniesInstitutionCode}".`);
  }

  if (sourceRecord) {
    const srcCheck = validateAcademicSourceRecord(sourceRecord);
    if (!srcCheck.isValid) {
      errors.push(srcCheck.error ?? 'AcademicSourceRecord inválido.');
    }
    if (sourceRecord.type === 'snies' && !institution.sniesInstitutionCode) {
      errors.push(
        `La institución "${institution.name}" no puede tener fuente tipo "snies" sin un sniesInstitutionCode verificado.`
      );
    }
    if (
      (sourceRecord.type === 'snies' || sourceRecord.type === 'men_open_data') &&
      !isOfficialMenSourceUrl(sourceRecord.sourceUrl) &&
      !verifyOfficialDomain(institution, sourceRecord.sourceUrl).isValid
    ) {
      errors.push(
        `La URL de fuente SNIES/MEN debe pertenecer a un dominio oficial gubernamental (.mineducacion.gov.co / .datos.gov.co) o al dominio institucional oficial verificado: "${sourceRecord.sourceUrl}".`
      );
    }
    if (
      sourceRecord.type === 'institution_website' &&
      !verifyOfficialDomain(institution, sourceRecord.sourceUrl).isValid
    ) {
      errors.push(
        `La URL de fuente institucional debe pertenecer al dominio oficial de la institución: "${sourceRecord.sourceUrl}".`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    institution: errors.length === 0 ? baseCheck.institution : null,
    errors,
  };
}

/**
 * Valida estrictamente un programa normalizado proveniente de SNIES / MEN Open Data / Portal Institucional.
 */
export function validateSniesProgram(
  program: AcademicProgram,
  institution?: Institution,
  sourceRecord?: AcademicSourceRecord
): SniesProgramValidationResult {
  const errors: string[] = [];

  if (!institution) {
    errors.push(
      `El programa "${program.name}" referencia una institución inexistente ("${program.institutionId}").`
    );
  }

  const baseCheck = validateAcademicProgram(program, institution);
  if (!baseCheck.isValid || !baseCheck.program) {
    errors.push(baseCheck.error ?? 'Programa académico inválido.');
  }

  if (program.sniesCode && !isValidSniesCodeFormat(program.sniesCode)) {
    errors.push(`Código SNIES de programa inválido: "${program.sniesCode}".`);
  }

  if (sourceRecord) {
    const srcCheck = validateAcademicSourceRecord(sourceRecord);
    if (!srcCheck.isValid) {
      errors.push(srcCheck.error ?? 'AcademicSourceRecord inválido.');
    }
    if (sourceRecord.type === 'snies' && !program.sniesCode) {
      errors.push(
        `El programa "${program.name}" no puede declararse con fuente tipo "snies" sin un código SNIES individual verificado.`
      );
    }
    if (
      (sourceRecord.type === 'snies' || sourceRecord.type === 'men_open_data') &&
      !isOfficialMenSourceUrl(sourceRecord.sourceUrl) &&
      !(institution && verifyOfficialDomain(institution, sourceRecord.sourceUrl).isValid)
    ) {
      errors.push(
        `La URL de fuente SNIES/MEN debe pertenecer a un dominio oficial gubernamental (.mineducacion.gov.co / .datos.gov.co) o al dominio institucional oficial verificado: "${sourceRecord.sourceUrl}".`
      );
    }
    if (
      sourceRecord.type === 'institution_website' &&
      institution &&
      !verifyOfficialDomain(institution, sourceRecord.sourceUrl).isValid
    ) {
      errors.push(
        `La URL de fuente institucional del programa "${program.name}" no coincide con el dominio oficial de la institución: "${sourceRecord.sourceUrl}".`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    program: errors.length === 0 ? baseCheck.program : null,
    errors,
  };
}
