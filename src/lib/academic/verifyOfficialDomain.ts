import { Institution } from '../../types/academic';

const PROHIBITED_THIRD_PARTY_DOMAINS = [
  'google.com',
  'google.com.co',
  'bing.com',
  'yahoo.com',
  'duckduckgo.com',
  'wikipedia.org',
  'wikimedia.org',
  'universia.net',
  'universia.net.co',
  'emagister.com',
  'emagister.com.co',
  'educaedu.com',
  'educaedu.com.co',
  'guiaacademica.com',
  'cursosycarreras.com.co',
  'estudios.com.co',
  'eltiempo.com',
  'elespectador.com',
  'semana.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'blogspot.com',
  'wordpress.com',
  'medium.com',
  'wixsite.com',
];

const OFFICIAL_MEN_DOMAINS = [
  'mineducacion.gov.co',
  'snies.mineducacion.gov.co',
  'hecaa.mineducacion.gov.co',
  'datos.gov.co',
];

export interface DomainVerificationResult {
  isValid: boolean;
  normalizedDomain?: string;
  isHttps: boolean;
  isOfficialInstitutionDomain: boolean;
  isOfficialMenDomain: boolean;
  isThirdPartyBlocked: boolean;
  reason?: string;
}

/**
 * Extrae y normaliza el dominio base (sin `www.`) de una URL o un nombre de dominio.
 */
export function extractNormalizedDomain(urlOrDomain: string): string | null {
  if (!urlOrDomain || typeof urlOrDomain !== 'string') return null;
  const trimmed = urlOrDomain.trim().toLowerCase();
  if (!trimmed) return null;

  try {
    const withProtocol =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!host || !host.includes('.')) return null;
    return host;
  } catch {
    return null;
  }
}

function matchesDomainOrSubdomain(hostname: string, targetDomain: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, '');
  return cleanHost === cleanTarget || cleanHost.endsWith(`.${cleanTarget}`);
}

export function isBlockedThirdPartyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    for (const blocked of PROHIBITED_THIRD_PARTY_DOMAINS) {
      if (matchesDomainOrSubdomain(host, blocked)) {
        return true;
      }
    }
    // Bloquear páginas de resultados de búsqueda aunque usen otro TLD
    if (
      parsed.pathname.includes('/search') &&
      (host.includes('google.') || host.includes('bing.') || host.includes('yahoo.'))
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function isOfficialMenSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    return OFFICIAL_MEN_DOMAINS.some((menDomain) =>
      matchesDomainOrSubdomain(host, menDomain)
    );
  } catch {
    return false;
  }
}

/**
 * Verifica que una URL pertenezca legítimamente al dominio oficial de la institución (Sección 10).
 *
 * Reglas:
 * 1. Debe ser una URL válida con protocolo HTTPS.
 * 2. Nunca acepta dominios de terceros (Wikipedia, agregadores educativos, blogs, Google Search, redes sociales).
 * 3. Debe coincidir exactamente con el `officialDomain` (o `officialWebsiteUrl` / `officialWebsite`) registrado de la institución
 *    o ser un subdominio directo de dicho dominio institucional.
 * 4. Rechaza dominios falsos o "lookalike" (ej. `https://universidadx-fake.com` o `https://unicartagena.edu.co.fake.com`).
 */
export function verifyOfficialDomain(
  institution: Pick<
    Institution,
    'name' | 'officialName' | 'officialDomain' | 'officialWebsiteUrl' | 'officialWebsite'
  >,
  url: string
): DomainVerificationResult {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      isValid: false,
      isHttps: false,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: false,
      isThirdPartyBlocked: false,
      reason: 'La URL proporcionada está vacía.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return {
      isValid: false,
      isHttps: false,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: false,
      isThirdPartyBlocked: false,
      reason: 'Formato de URL inválido.',
    };
  }

  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    return {
      isValid: false,
      isHttps: false,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: false,
      isThirdPartyBlocked: false,
      reason: 'El dominio oficial debe utilizar protocolo seguro HTTPS.',
    };
  }

  const cleanHost = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (isBlockedThirdPartyUrl(url)) {
    return {
      isValid: false,
      normalizedDomain: cleanHost,
      isHttps: true,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: false,
      isThirdPartyBlocked: true,
      reason: `El dominio "${cleanHost}" corresponde a un tercero, agregador educativo, buscador o directorio no autorizado como fuente oficial.`,
    };
  }

  const isMen = isOfficialMenSourceUrl(url);

  const registeredDomain =
    extractNormalizedDomain(institution.officialDomain ?? '') ??
    extractNormalizedDomain(institution.officialWebsiteUrl ?? '') ??
    extractNormalizedDomain(institution.officialWebsite ?? '');

  if (!registeredDomain) {
    return {
      isValid: false,
      normalizedDomain: cleanHost,
      isHttps: true,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: isMen,
      isThirdPartyBlocked: false,
      reason:
        'La institución no tiene un dominio oficial registrado contra el cual verificar la URL.',
    };
  }

  const matchesInstitution = matchesDomainOrSubdomain(cleanHost, registeredDomain);
  if (!matchesInstitution) {
    return {
      isValid: false,
      normalizedDomain: cleanHost,
      isHttps: true,
      isOfficialInstitutionDomain: false,
      isOfficialMenDomain: isMen,
      isThirdPartyBlocked: false,
      reason: `El dominio "${cleanHost}" no coincide con el dominio oficial registrado de la institución ("${registeredDomain}").`,
    };
  }

  return {
    isValid: true,
    normalizedDomain: cleanHost,
    isHttps: true,
    isOfficialInstitutionDomain: true,
    isOfficialMenDomain: isMen,
    isThirdPartyBlocked: false,
  };
}
