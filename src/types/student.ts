export interface Location {
  department: string;
  city: string;
}

export type Modality = 'Presencial' | 'Virtual' | 'Distancia' | 'Dual' | 'Híbrida' | 'Cualquiera';
export type SectorPreference = 'Pública' | 'Privada' | 'Cualquiera';
export type InstitutionType =
  | 'Universidad'
  | 'Institución Universitaria'
  | 'Institución Tecnológica'
  | 'Técnica Profesional'
  | 'SENA'
  | 'Pública'
  | 'Privada'
  | 'Cualquiera';
export type Flexibility = 'Misma ciudad' | 'Mismo departamento' | 'Cualquier lugar del país';

export interface StudentContextData {
  currentLocation: Location | null;
  targetLocation: Location | null;
  locationFlexibility: Flexibility | null;
  preferredModality: Modality | null;
  preferredInstitutionType: InstitutionType | null;
  preferredSector?: SectorPreference | null;
  isComplete: boolean;
}
