import {
  AcademicInstitutionType,
  AcademicLevel,
  AcademicModality,
  AcademicProgram,
  AcademicProgramStatus,
  AcademicSector,
  AcademicSource,
  AcademicSourceProvider,
  AcademicSourceRecord,
  AcademicSourceType,
  Institution,
  SourceVerificationStatus,
} from '../../types/academic';
import {
  extractNormalizedDomain,
  isBlockedThirdPartyUrl,
  verifyOfficialDomain,
} from './verifyOfficialDomain';

const VALID_PROVIDERS: AcademicSourceProvider[] = [
  'snies',
  'men_open_data',
  'institution_official',
  'institution_website',
  'mock',
];

const VALID_SOURCE_TYPES: AcademicSourceType[] = [
  'snies',
  'men_open_data',
  'institution_website',
  'mock',
];

const VALID_VERIFICATION_STATUSES: SourceVerificationStatus[] = [
  'verified',
  'partial',
  'stale',
  'unavailable',
  'mock',
];

const VALID_INSTITUTION_TYPES: AcademicInstitutionType[] = [
  'university',
  'university_institution',
  'technological',
  'technical',
  'technical_professional',
  'sena',
  'other',
];

const VALID_SECTORS: AcademicSector[] = ['public', 'private', 'mixed', 'unknown'];

const VALID_LEVELS: AcademicLevel[] = [
  'technical_professional',
  'technological',
  'professional',
  'specialization',
  'masters',
  'doctorate',
  'other',
];

const VALID_MODALITIES: AcademicModality[] = [
  'presential',
  'virtual',
  'hybrid',
  'unknown',
];

const VALID_STATUSES: AcademicProgramStatus[] = ['active', 'inactive', 'unknown'];

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export function isValidSniesCodeFormat(code: string): boolean {
  return /^\d{1,10}$/.test(code.trim());
}

export function validateAcademicSourceRecord(raw: unknown): {
  isValid: boolean;
  sourceRecord: AcademicSourceRecord | null;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      sourceRecord: null,
      error: 'AcademicSourceRecord no es un objeto.',
    };
  }

  const candidate = raw as Partial<AcademicSourceRecord>;
  if (typeof candidate.sourceId !== 'string' || !candidate.sourceId.trim()) {
    return {
      isValid: false,
      sourceRecord: null,
      error: 'Falta sourceId válido en AcademicSourceRecord.',
    };
  }

  if (!candidate.type || !VALID_SOURCE_TYPES.includes(candidate.type)) {
    return {
      isValid: false,
      sourceRecord: null,
      error: `Tipo de fuente académica inválido: "${String(candidate.type)}".`,
    };
  }

  if (
    !candidate.verificationStatus ||
    !VALID_VERIFICATION_STATUSES.includes(candidate.verificationStatus)
  ) {
    return {
      isValid: false,
      sourceRecord: null,
      error: `verificationStatus inválido: "${String(candidate.verificationStatus)}".`,
    };
  }

  // Regla Sección 19 y 36: una fuente mock NUNCA puede tener verificationStatus === 'verified'
  if (candidate.type === 'mock' && candidate.verificationStatus === 'verified') {
    return {
      isValid: false,
      sourceRecord: null,
      error: 'Una fuente mock nunca puede marcarse como verified.',
    };
  }

  if (candidate.type !== 'mock') {
    if (
      typeof candidate.sourceUrl !== 'string' ||
      !isValidHttpUrl(candidate.sourceUrl) ||
      isBlockedThirdPartyUrl(candidate.sourceUrl)
    ) {
      return {
        isValid: false,
        sourceRecord: null,
        error: 'sourceUrl inválida o perteneciente a un tercero bloqueado.',
      };
    }
  }

  return {
    isValid: true,
    sourceRecord: candidate as AcademicSourceRecord,
  };
}

export function validateAcademicSource(raw: unknown): {
  isValid: boolean;
  source: AcademicSource | null;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, source: null, error: 'AcademicSource no es un objeto.' };
  }

  const candidate = raw as Partial<AcademicSource>;
  if (!candidate.provider || !VALID_PROVIDERS.includes(candidate.provider)) {
    return {
      isValid: false,
      source: null,
      error: `Proveedor de fuente académica inválido: "${String(candidate.provider)}".`,
    };
  }

  if (
    candidate.verificationStatus !== undefined &&
    !VALID_VERIFICATION_STATUSES.includes(candidate.verificationStatus)
  ) {
    return {
      isValid: false,
      source: null,
      error: `verificationStatus inválido en AcademicSource: "${String(
        candidate.verificationStatus
      )}".`,
    };
  }

  if (
    candidate.provider === 'mock' &&
    candidate.verificationStatus === 'verified'
  ) {
    return {
      isValid: false,
      source: null,
      error: 'Un proveedor mock nunca puede tener verificationStatus = "verified".',
    };
  }

  if (candidate.sourceUrl !== undefined) {
    if (
      typeof candidate.sourceUrl !== 'string' ||
      !isValidHttpUrl(candidate.sourceUrl) ||
      isBlockedThirdPartyUrl(candidate.sourceUrl)
    ) {
      return {
        isValid: false,
        source: null,
        error: 'sourceUrl inválida en AcademicSource.',
      };
    }
  }

  return {
    isValid: true,
    source: {
      provider: candidate.provider,
      sourceId: candidate.sourceId,
      type: candidate.type,
      sourceUrl: candidate.sourceUrl,
      verificationStatus:
        candidate.verificationStatus ??
        (candidate.provider === 'mock' ? 'mock' : 'verified'),
      retrievedAt: candidate.retrievedAt,
      lastVerifiedAt: candidate.lastVerifiedAt,
      contentHash: candidate.contentHash,
      notes: candidate.notes,
    },
  };
}

export function validateInstitution(raw: unknown): {
  isValid: boolean;
  institution: Institution | null;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, institution: null, error: 'Institution no es un objeto.' };
  }

  const candidate = raw as Partial<Institution>;
  if (typeof candidate.institutionId !== 'string' || !candidate.institutionId.trim()) {
    return { isValid: false, institution: null, error: 'Falta institutionId válido.' };
  }

  const effectiveName = (candidate.officialName ?? candidate.name ?? '').trim();
  if (!effectiveName) {
    return {
      isValid: false,
      institution: null,
      error: 'Falta name / officialName válido en Institution.',
    };
  }

  if (
    !candidate.institutionType ||
    !VALID_INSTITUTION_TYPES.includes(candidate.institutionType)
  ) {
    return {
      isValid: false,
      institution: null,
      error: `institutionType inválido: "${String(candidate.institutionType)}".`,
    };
  }

  if (!candidate.sector || !VALID_SECTORS.includes(candidate.sector)) {
    return {
      isValid: false,
      institution: null,
      error: `sector inválido: "${String(candidate.sector)}".`,
    };
  }

  const effectiveCity = (candidate.municipality ?? candidate.city ?? '').trim();
  if (!effectiveCity) {
    return { isValid: false, institution: null, error: 'Falta city válida en Institution.' };
  }

  if (typeof candidate.department !== 'string' || !candidate.department.trim()) {
    return {
      isValid: false,
      institution: null,
      error: 'Falta department válido en Institution.',
    };
  }

  const sourceCheck = validateAcademicSource(candidate.source);
  if (!sourceCheck.isValid || !sourceCheck.source) {
    return {
      isValid: false,
      institution: null,
      error: sourceCheck.error ?? 'source inválido en Institution.',
    };
  }

  const sniesCode = candidate.sniesInstitutionCode ?? candidate.sniesCode;

  // Regla de integridad: una institución mock no puede declarar falsamente código SNIES oficial ni sourceStatus = verified
  if (sourceCheck.source.provider === 'mock') {
    if (sniesCode) {
      return {
        isValid: false,
        institution: null,
        error: 'Un registro mock no debe declarar un código SNIES oficial.',
      };
    }
    if (candidate.sourceStatus === 'verified') {
      return {
        isValid: false,
        institution: null,
        error: 'Una institución mock nunca puede tener sourceStatus = "verified".',
      };
    }
  }

  if (sniesCode !== undefined && !isValidSniesCodeFormat(sniesCode)) {
    return {
      isValid: false,
      institution: null,
      error: `Formato de código SNIES institucional inválido: "${sniesCode}".`,
    };
  }

  const websiteUrl = candidate.officialWebsiteUrl ?? candidate.officialWebsite;
  if (websiteUrl !== undefined) {
    if (
      typeof websiteUrl !== 'string' ||
      !isValidHttpUrl(websiteUrl) ||
      isBlockedThirdPartyUrl(websiteUrl)
    ) {
      return {
        isValid: false,
        institution: null,
        error: 'officialWebsite / officialWebsiteUrl inválida en Institution.',
      };
    }

    if (candidate.officialDomain) {
      const domainVerify = verifyOfficialDomain(
        {
          name: effectiveName,
          officialName: candidate.officialName,
          officialDomain: candidate.officialDomain,
          officialWebsiteUrl: websiteUrl,
          officialWebsite: websiteUrl,
        },
        websiteUrl
      );
      if (!domainVerify.isValid) {
        return {
          isValid: false,
          institution: null,
          error:
            domainVerify.reason ??
            'officialWebsiteUrl no coincide con el officialDomain de la institución.',
        };
      }
    }
  }

  if (candidate.officialDomain !== undefined) {
    const normDomain = extractNormalizedDomain(candidate.officialDomain);
    if (!normDomain || isBlockedThirdPartyUrl(`https://${normDomain}`)) {
      return {
        isValid: false,
        institution: null,
        error: `officialDomain inválido en Institution: "${candidate.officialDomain}".`,
      };
    }
  }

  const hasInstSniesCode = Boolean(sniesCode && sniesCode.trim().length > 0);
  const effectiveInstVerificationStatus: SourceVerificationStatus =
    sourceCheck.source.provider === 'mock'
      ? 'mock'
      : !hasInstSniesCode &&
        (candidate.sourceStatus === 'verified' ||
          sourceCheck.source.verificationStatus === 'verified' ||
          candidate.sourceStatus === undefined)
      ? 'partial'
      : candidate.sourceStatus ?? sourceCheck.source.verificationStatus ?? 'verified';

  return {
    isValid: true,
    institution: {
      ...(candidate as Institution),
      name: candidate.name || effectiveName,
      officialName: candidate.officialName ?? effectiveName,
      city: candidate.city || effectiveCity,
      municipality: candidate.municipality ?? effectiveCity,
      sniesCode: sniesCode,
      sniesInstitutionCode: sniesCode,
      officialWebsite: websiteUrl,
      officialWebsiteUrl: websiteUrl,
      sourceStatus: effectiveInstVerificationStatus,
      source: {
        ...sourceCheck.source,
        verificationStatus: effectiveInstVerificationStatus,
      },
    },
  };
}

export function validateAcademicProgram(
  raw: unknown,
  institution?: Institution
): {
  isValid: boolean;
  program: AcademicProgram | null;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, program: null, error: 'AcademicProgram no es un objeto.' };
  }

  const candidate = raw as Partial<AcademicProgram>;
  if (typeof candidate.programId !== 'string' || !candidate.programId.trim()) {
    return { isValid: false, program: null, error: 'Falta programId válido.' };
  }

  if (typeof candidate.institutionId !== 'string' || !candidate.institutionId.trim()) {
    return { isValid: false, program: null, error: 'Falta institutionId válido.' };
  }

  const effectiveName = (candidate.officialName ?? candidate.name ?? '').trim();
  if (!effectiveName) {
    return {
      isValid: false,
      program: null,
      error: 'Falta name / officialName válido en AcademicProgram.',
    };
  }

  if (!candidate.academicLevel || !VALID_LEVELS.includes(candidate.academicLevel)) {
    return {
      isValid: false,
      program: null,
      error: `academicLevel inválido: "${String(candidate.academicLevel)}".`,
    };
  }

  if (!candidate.modality || !VALID_MODALITIES.includes(candidate.modality)) {
    return {
      isValid: false,
      program: null,
      error: `modality inválida: "${String(candidate.modality)}".`,
    };
  }

  if (!candidate.status || !VALID_STATUSES.includes(candidate.status)) {
    return {
      isValid: false,
      program: null,
      error: `status inválido: "${String(candidate.status)}".`,
    };
  }

  const effectiveCity = (candidate.municipality ?? candidate.city ?? '').trim();
  if (!effectiveCity) {
    return { isValid: false, program: null, error: 'Falta city válida en AcademicProgram.' };
  }

  if (typeof candidate.department !== 'string' || !candidate.department.trim()) {
    return {
      isValid: false,
      program: null,
      error: 'Falta department válido en AcademicProgram.',
    };
  }

  const sourceCheck = validateAcademicSource(candidate.source);
  if (!sourceCheck.isValid || !sourceCheck.source) {
    return {
      isValid: false,
      program: null,
      error: sourceCheck.error ?? 'source inválido en AcademicProgram.',
    };
  }

  if (sourceCheck.source.provider === 'mock') {
    if (candidate.sniesCode) {
      return {
        isValid: false,
        program: null,
        error: 'Un programa mock no debe declarar un código SNIES oficial.',
      };
    }
    if (candidate.sourceStatus === 'verified') {
      return {
        isValid: false,
        program: null,
        error: 'Un programa mock nunca puede tener sourceStatus = "verified".',
      };
    }
  }

  if (candidate.sniesCode !== undefined && !isValidSniesCodeFormat(candidate.sniesCode)) {
    return {
      isValid: false,
      program: null,
      error: `Formato de código SNIES de programa inválido: "${candidate.sniesCode}".`,
    };
  }

  const programUrl = candidate.officialProgramUrl ?? candidate.officialUrl;
  if (programUrl !== undefined) {
    if (
      typeof programUrl !== 'string' ||
      !isValidHttpUrl(programUrl) ||
      isBlockedThirdPartyUrl(programUrl)
    ) {
      return {
        isValid: false,
        program: null,
        error: 'officialUrl / officialProgramUrl inválida en AcademicProgram.',
      };
    }

    if (institution && (institution.officialDomain || institution.officialWebsiteUrl || institution.officialWebsite)) {
      const domainVerify = verifyOfficialDomain(institution, programUrl);
      if (!domainVerify.isValid) {
        return {
          isValid: false,
          program: null,
          error:
            domainVerify.reason ??
            'officialProgramUrl no pertenece al dominio oficial de la institución.',
        };
      }
    }
  }

  const hasSniesCode = Boolean(candidate.sniesCode && candidate.sniesCode.trim().length > 0);
  const effectiveSourceVerificationStatus: SourceVerificationStatus =
    sourceCheck.source.provider === 'mock'
      ? 'mock'
      : !hasSniesCode &&
        (candidate.sourceStatus === 'verified' ||
          sourceCheck.source.verificationStatus === 'verified' ||
          candidate.sourceStatus === undefined)
      ? 'partial'
      : candidate.sourceStatus ?? sourceCheck.source.verificationStatus ?? 'verified';

  return {
    isValid: true,
    program: {
      ...(candidate as AcademicProgram),
      name: candidate.name || effectiveName,
      officialName: candidate.officialName ?? effectiveName,
      city: candidate.city || effectiveCity,
      municipality: candidate.municipality ?? effectiveCity,
      officialUrl: programUrl,
      officialProgramUrl: programUrl,
      sourceStatus: effectiveSourceVerificationStatus,
      source: {
        ...sourceCheck.source,
        verificationStatus: effectiveSourceVerificationStatus,
      },
    },
  };
}
