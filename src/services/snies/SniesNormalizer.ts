import {
  computeSourceVerificationStatus,
  extractNormalizedDomain,
  normalizeAcademicText,
  normalizeProgramDeduplicationName,
} from '../../lib/academic';
import {
  AcademicInstitutionType,
  AcademicLevel,
  AcademicModality,
  AcademicProgram,
  AcademicProgramStatus,
  AcademicSector,
  AcademicSourceRecord,
  Institution,
} from '../../types/academic';
import {
  NormalizedField,
  RawSniesInstitutionInput,
  RawSniesProgramInput,
} from '../../types/ingestion';

const MUNICIPALITY_CANONICAL_NAMES: Record<string, string> = {
  'cartagena': 'Cartagena',
  'cartagena de indias': 'Cartagena',
  'cartagena d t y c': 'Cartagena',
  'bogota': 'Bogotá D.C.',
  'bogota d c': 'Bogotá D.C.',
  'santa fe de bogota': 'Bogotá D.C.',
  'medellin': 'Medellín',
  'cali': 'Cali',
  'santiago de cali': 'Cali',
  'barranquilla': 'Barranquilla',
  'bucaramanga': 'Bucaramanga',
  'manizales': 'Manizales',
  'pereira': 'Pereira',
  'santa marta': 'Santa Marta',
  'monteria': 'Montería',
  'tunja': 'Tunja',
  'popayan': 'Popayán',
};

const DEPARTMENT_CANONICAL_NAMES: Record<string, string> = {
  'bolivar': 'Bolívar',
  'bogota d c': 'Bogotá D.C.',
  'cundinamarca': 'Cundinamarca',
  'antioquia': 'Antioquia',
  'valle del cauca': 'Valle del Cauca',
  'atlantico': 'Atlántico',
  'santander': 'Santander',
  'caldas': 'Caldas',
  'risaralda': 'Risaralda',
  'magdalena': 'Magdalena',
  'cordoba': 'Córdoba',
  'boyaca': 'Boyacá',
  'cauca': 'Cauca',
};

export function normalizeMunicipalityField(raw: string): NormalizedField<string> {
  const normKey = normalizeAcademicText(raw);
  const canonical = MUNICIPALITY_CANONICAL_NAMES[normKey] ?? raw.trim();
  return {
    rawValue: raw,
    normalizedValue: canonical,
  };
}

export function normalizeDepartmentField(raw: string): NormalizedField<string> {
  const normKey = normalizeAcademicText(raw);
  const canonical = DEPARTMENT_CANONICAL_NAMES[normKey] ?? raw.trim();
  return {
    rawValue: raw,
    normalizedValue: canonical,
  };
}

export function normalizeInstitutionTypeField(
  raw: string
): NormalizedField<AcademicInstitutionType> {
  const norm = normalizeAcademicText(raw);
  let value: AcademicInstitutionType = 'other';
  if (norm.includes('sena')) {
    value = 'sena';
  } else if (
    norm.includes('institucion universitaria') ||
    norm.includes('escuela tecnologica')
  ) {
    value = 'university_institution';
  } else if (norm.includes('universidad')) {
    value = 'university';
  } else if (norm.includes('tecnologic')) {
    value = 'technological';
  } else if (
    norm.includes('tecnica profesional') ||
    norm.includes('tecnico profesional')
  ) {
    value = 'technical_professional';
  }
  return { rawValue: raw, normalizedValue: value };
}

export function normalizeSectorField(raw: string): NormalizedField<AcademicSector> {
  const norm = normalizeAcademicText(raw);
  let value: AcademicSector = 'unknown';
  if (norm.includes('oficial') || norm.includes('public')) {
    value = 'public';
  } else if (norm.includes('privad')) {
    value = 'private';
  } else if (norm.includes('mixt')) {
    value = 'mixed';
  }
  return { rawValue: raw, normalizedValue: value };
}

export function normalizeAcademicLevelField(raw: string): NormalizedField<AcademicLevel> {
  const norm = normalizeAcademicText(raw);
  let value: AcademicLevel = 'other';
  if (norm.includes('doctorado')) {
    value = 'doctorate';
  } else if (norm.includes('maestria') || norm.includes('magister')) {
    value = 'masters';
  } else if (norm.includes('especializacion')) {
    value = 'specialization';
  } else if (
    norm.includes('universitari') ||
    norm.includes('profesional') ||
    norm.includes('pregrado')
  ) {
    value = 'professional';
  } else if (norm.includes('tecnologic')) {
    value = 'technological';
  } else if (norm.includes('tecnic')) {
    value = 'technical_professional';
  }
  return { rawValue: raw, normalizedValue: value };
}

export function normalizeModalityField(raw: string): NormalizedField<AcademicModality> {
  const norm = normalizeAcademicText(raw);
  let value: AcademicModality = 'unknown';
  if (norm.includes('virtual')) {
    value = 'virtual';
  } else if (
    norm.includes('hibrid') ||
    norm.includes('combinad') ||
    norm.includes('distancia') ||
    norm.includes('dual')
  ) {
    value = 'hybrid';
  } else if (norm.includes('presencial')) {
    value = 'presential';
  }
  return { rawValue: raw, normalizedValue: value };
}

export function normalizeProgramStatusField(
  raw: string
): NormalizedField<AcademicProgramStatus> {
  const norm = normalizeAcademicText(raw);
  let value: AcademicProgramStatus = 'unknown';
  if (norm === 'activo' || norm === 'active') {
    value = 'active';
  } else if (norm === 'inactivo' || norm === 'inactive') {
    value = 'inactive';
  }
  return { rawValue: raw, normalizedValue: value };
}

export function normalizeRawSniesInstitution(
  input: RawSniesInstitutionInput,
  referenceDateIso?: string
): {
  institution: Institution;
  sourceRecord: AcademicSourceRecord;
} {
  const code = input.sniesInstitutionCode?.trim() || undefined;
  const institutionId = code
    ? `snies_inst_${code}`
    : `inst_${normalizeAcademicText(input.officialName).replace(/\s+/g, '_')}`;

  // Regla de auditoría F6A.1: sin código IES SNIES verificado, la fuente no puede declararse como 'snies'
  const requestedSourceType = input.sourceType ?? (code ? 'snies' : 'institution_website');
  const sourceType = !code && requestedSourceType === 'snies'
    ? 'institution_website'
    : requestedSourceType;

  const verificationStatus = computeSourceVerificationStatus({
    sourceType,
    lastVerifiedAt: input.lastVerifiedAt,
    isSourceAvailable: Boolean(input.sourceUrl),
    hasVerifiedSniesCode: Boolean(code),
    referenceDateIso,
  });

  const sourceId = `src_${institutionId}_${sourceType}`;
  const sourceRecord: AcademicSourceRecord = {
    sourceId,
    type: sourceType,
    sourceUrl: input.sourceUrl,
    institutionId,
    verificationStatus,
    retrievedAt: input.retrievedAt,
    lastVerifiedAt: input.lastVerifiedAt,
    notes: input.notes,
  };

  const cityNorm = normalizeMunicipalityField(input.municipality);
  const deptNorm = normalizeDepartmentField(input.department);
  const instTypeNorm = normalizeInstitutionTypeField(input.academicCharacter);
  const sectorNorm = normalizeSectorField(input.sector);
  const statusNorm = normalizeProgramStatusField(input.status ?? 'Activo');

  const officialDomain =
    extractNormalizedDomain(input.officialDomain ?? '') ??
    extractNormalizedDomain(input.officialWebsiteUrl ?? '') ??
    undefined;

  const provider =
    sourceType === 'men_open_data'
      ? 'men_open_data'
      : sourceType === 'institution_website'
      ? 'institution_website'
      : sourceType === 'mock'
      ? 'mock'
      : 'snies';

  const institution: Institution = {
    institutionId,
    name: input.officialName.trim(),
    officialName: input.officialName.trim(),
    shortName: input.shortName?.trim() || undefined,
    institutionType: instTypeNorm.normalizedValue,
    sector: sectorNorm.normalizedValue,
    city: cityNorm.normalizedValue,
    municipality: cityNorm.normalizedValue,
    department: deptNorm.normalizedValue,
    sniesCode: code,
    sniesInstitutionCode: code,
    nit: input.nit?.trim() || undefined,
    accreditation: input.accreditation?.trim() || undefined,
    officialWebsite: input.officialWebsiteUrl?.trim() || undefined,
    officialWebsiteUrl: input.officialWebsiteUrl?.trim() || undefined,
    officialDomain,
    status: statusNorm.normalizedValue,
    sourceStatus: verificationStatus,
    source: {
      provider,
      sourceId,
      type: sourceType,
      sourceUrl: input.sourceUrl,
      verificationStatus,
      retrievedAt: input.retrievedAt,
      lastVerifiedAt: input.lastVerifiedAt,
      notes: input.notes,
    },
    lastVerifiedAt: input.lastVerifiedAt,
  };

  return { institution, sourceRecord };
}

export function normalizeRawSniesProgram(
  input: RawSniesProgramInput,
  resolvedInstitutionId: string,
  referenceDateIso?: string
): {
  program: AcademicProgram;
  sourceRecord: AcademicSourceRecord;
} {
  const sniesCode = input.sniesProgramCode?.trim() || undefined;
  const cityNorm = normalizeMunicipalityField(input.municipality);
  const deptNorm = normalizeDepartmentField(input.department);
  const levelNorm = normalizeAcademicLevelField(input.academicLevel);
  const modalityNorm = normalizeModalityField(input.modality);
  const statusNorm = normalizeProgramStatusField(input.status);

  const normProgName = normalizeProgramDeduplicationName(input.officialName);
  const programId = sniesCode
    ? `snies_prog_${sniesCode}`
    : `prog_${resolvedInstitutionId}_${normProgName.replace(/\s+/g, '_')}_${normalizeAcademicText(cityNorm.normalizedValue).replace(/\s+/g, '_')}`;

  // Regla de auditoría F6A.1: un programa sin sniesProgramCode individual no puede declararse como tipo 'snies'
  const requestedSourceType = input.sourceType ?? (sniesCode ? 'snies' : 'men_open_data');
  const sourceType = !sniesCode && requestedSourceType === 'snies'
    ? 'men_open_data'
    : requestedSourceType;

  const verificationStatus = computeSourceVerificationStatus({
    sourceType,
    lastVerifiedAt: input.lastVerifiedAt,
    isSourceAvailable: Boolean(input.sourceUrl),
    hasVerifiedSniesCode: Boolean(sniesCode),
    referenceDateIso,
  });

  const sourceId = `src_${programId}_${sourceType}`;
  const sourceRecord: AcademicSourceRecord = {
    sourceId,
    type: sourceType,
    sourceUrl: input.sourceUrl,
    institutionId: resolvedInstitutionId,
    programId,
    verificationStatus,
    retrievedAt: input.retrievedAt,
    lastVerifiedAt: input.lastVerifiedAt,
    notes: input.notes,
  };

  const provider =
    sourceType === 'men_open_data'
      ? 'men_open_data'
      : sourceType === 'institution_website'
      ? 'institution_website'
      : sourceType === 'mock'
      ? 'mock'
      : 'snies';

  const program: AcademicProgram = {
    programId,
    institutionId: resolvedInstitutionId,
    name: input.officialName.trim(),
    officialName: input.officialName.trim(),
    normalizedName: normProgName,
    academicLevel: levelNorm.normalizedValue,
    modality: modalityNorm.normalizedValue,
    city: cityNorm.normalizedValue,
    municipality: cityNorm.normalizedValue,
    department: deptNorm.normalizedValue,
    sniesCode,
    status: statusNorm.normalizedValue,
    officialUrl: input.officialProgramUrl?.trim() || undefined,
    officialProgramUrl: input.officialProgramUrl?.trim() || undefined,
    officialSourceId: sourceId,
    sourceStatus: verificationStatus,
    source: {
      provider,
      sourceId,
      type: sourceType,
      sourceUrl: input.sourceUrl,
      verificationStatus,
      retrievedAt: input.retrievedAt,
      lastVerifiedAt: input.lastVerifiedAt,
      notes: input.notes,
    },
    lastVerifiedAt: input.lastVerifiedAt,
  };

  return { program, sourceRecord };
}
