import {
  SniesVerifiedInstitutionRecord,
  SniesVerifiedProgramRecord,
} from './snies.types';

export interface SniesDatasetSnapshot {
  available: boolean;
  retrievedAt: string;
  lastVerifiedAt?: string;
  institutions: SniesVerifiedInstitutionRecord[];
  programs: SniesVerifiedProgramRecord[];
  reason?: string;
}

/**
 * Cliente para la fuente oficial SNIES.
 *
 * REGLA SECCIONES 3 y 28:
 * SNIES no dispone de una REST API pública abierta confirmada en este entorno.
 * NO se inventan endpoints HTTP ficticios como `https://snies.mineducacion.gov.co/api/programs`.
 * Este cliente permanece listo para recibir un dataset oficial verificado del MEN cuando se inyecte
 * o configure en el backend, e informa transparentemente cuando no hay conexión activa.
 */
export class SniesClient {
  private verifiedSnapshot: SniesDatasetSnapshot | null = null;

  constructor(initialSnapshot?: SniesDatasetSnapshot) {
    if (initialSnapshot) {
      this.verifiedSnapshot = initialSnapshot;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.verifiedSnapshot && this.verifiedSnapshot.available);
  }

  public async fetchVerifiedDataset(): Promise<SniesDatasetSnapshot> {
    if (this.verifiedSnapshot && this.verifiedSnapshot.available) {
      return this.verifiedSnapshot;
    }

    return {
      available: false,
      retrievedAt: new Date().toISOString(),
      institutions: [],
      programs: [],
      reason:
        'Fuente oficial SNIES aún no conectada en este entorno. No se realizan llamadas a endpoints no verificados.',
    };
  }
}
