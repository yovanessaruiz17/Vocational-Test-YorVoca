# Informe de Auditoría de Datos Académicos Reales, Verificación y Procedencia (Fase 6A.1)

**Versión:** `1.6.1-PHASE6A1-ACADEMIC-DATA-AUDIT`  
**Fecha de auditoría:** `2026-10-06`

---

## 1. Resumen Ejecutivo

Durante la auditoría F6A.1 se contrastó cada institución, programa, código SNIES, NIT, dominio `.edu.co` y estado de verificación en `src/data/academic/verifiedColombianCatalog.ts` contra **fuentes primarias oficiales** (SNIES / Ministerio de Educación Nacional, `datos.gov.co` y los portales oficiales `.edu.co` de cada institución), descartando cualquier referencia proveniente de directorios comerciales, agregadores educativos o sitios de terceros.

### Resultado global antes vs. después de la auditoría

| Métrica | Reportado en F6A (pre-auditoría) | Estado real tras auditoría F6A.1 |
| :--- | :--- | :--- |
| **Instituciones totales** | 11 | **11** |
| **Instituciones con código IES SNIES verificado en fuente primaria** | 11 (pero 5 códigos eran erróneos) | **10 verificadas en fuente primaria** + **1 sin código IES local (`undefined`)** |
| **Programas totales** | 33 | **33** |
| **Programas con código SNIES individual verificado en fuente primaria** | 15 (pero los 15 códigos eran erróneos/no verificados) | **18 verificados en fuente primaria oficial (`.edu.co` / MEN)** |
| **Programas sin código SNIES individual (`sniesCode: undefined`, parciales)** | 18 | **15 clasificados como información oficial parcial** |
| ** Contenidos descriptivos oficiales (`ProgramOfficialContent`)** | 4 (vinculados a códigos erróneos) | **4 vinculados a los programas e IDs auditados** |

---

## 2. Auditoría Detallada de Instituciones (11 registros)

| # | Institución | Valor en F6A | Hallazgo de Auditoría F6A.1 | Valor Auditado Final | Fuente Primaria Oficial | Acción |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Universidad de Cartagena** | IES `1206`, NIT `890480123-5` | El código IES `1206` pertenece a la *Universidad de Caldas*. En la sección oficial de Naturaleza Jurídica de `unicartagena.edu.co`, el código IES es **`1205`**. | IES **`1205`**, NIT `890480123-5`, `unicartagena.edu.co` | `https://www.unicartagena.edu.co` + MEN | **Corregido** |
| 2 | **Universidad Tecnológica de Bolívar (UTB)** | IES `1828`, NIT `890480036-2` | El código IES `1828` pertenece a la *Universidad ICESI* (Cali) y el NIT estaba errado. En documentación oficial del MEN (`LP-MEN-01-2022`) y DIAN/Minciencias, el código IES es **`1830`** y el NIT es **`890401962-0`**. | IES **`1830`**, NIT **`890401962-0`**, `utb.edu.co` | `https://www.mineducacion.gov.co` + `https://www.utb.edu.co` | **Corregido** |
| 3 | **Fundación Universitaria Tecnológico Comfenalco** | IES `2725`, NIT `undefined` | El código IES `2725` pertenece al *Politécnico Grancolombiano* (Bogotá). Se verificó el NIT oficial **`890481183-1`** y el dominio `tecnologicocomfenalco.edu.co`. Al no confirmarse el código IES de 4 dígitos en fuente primaria directa, se removió `2725`. | IES `undefined`, NIT **`890481183-1`**, `sourceType: 'institution_website'` | `https://tecnologicocomfenalco.edu.co` + MEN | **Degradado a parcial (código falso eliminado)** |
| 4 | **Institución Universitaria Mayor de Cartagena** | IES `2209`, sigla `Unimayor Cartagena` | El código IES `2209` pertenece al *Politécnico Colombiano Jaime Isaza Cadavid* (Medellín). En `datos.gov.co` (MEN) y `umayor.edu.co`, su código IES oficial es **`3103`**, su NIT es **`890480054-5`** y su sigla es **`UMayor`**. | IES **`3103`**, NIT **`890480054-5`**, sigla **`UMayor`**, `umayor.edu.co` | `https://www.datos.gov.co` + `https://www.umayor.edu.co` | **Corregido** |
| 5 | **Servicio Nacional de Aprendizaje - SENA** | IES `9110`, NIT `899999034-1` | Código IES `9110` y NIT `899999034-1` coinciden con los registros oficiales del MEN y `sena.edu.co`. | IES **`9110`**, NIT `899999034-1`, `sena.edu.co` | `https://www.mineducacion.gov.co` + `https://www.sena.edu.co` | **Confirmado** |
| 6 | **Universidad Nacional de Colombia (Sede Bogotá)** | IES `1101`, NIT `899999063-3` | Código IES `1101` y NIT `899999063-3` coinciden con los registros oficiales del MEN y `unal.edu.co`. | IES **`1101`**, NIT `899999063-3`, `unal.edu.co` | `https://www.mineducacion.gov.co` + `https://unal.edu.co` | **Confirmado** |
| 7 | **Universidad de Antioquia (UdeA)** | IES `1201`, NIT `890980040-8` | Código IES `1201` y NIT `890980040-8` coinciden con los registros oficiales del MEN y `udea.edu.co`. | IES **`1201`**, NIT `890980040-8`, `udea.edu.co` | `https://www.mineducacion.gov.co` + `https://www.udea.edu.co` | **Confirmado** |
| 8 | **Universidad del Valle (Univalle)** | IES `1203`, NIT `890399010-6` | Código IES `1203` y NIT `890399010-6` coinciden con `datos.gov.co` y `univalle.edu.co`. | IES **`1203`**, NIT `890399010-6`, `univalle.edu.co` | `https://www.datos.gov.co` + `https://www.univalle.edu.co` | **Confirmado** |
| 9 | **Universidad del Norte (Uninorte)** | IES `1714`, NIT `890101681-9` | El código IES `1714` pertenece al *Colegio Mayor de Nuestra Señora del Rosario* (Bogotá). El código IES oficial de la Universidad del Norte (Barranquilla) es **`1713`**. | IES **`1713`**, NIT `890101681-9`, `uninorte.edu.co` | `https://www.mineducacion.gov.co` + `https://www.uninorte.edu.co` | **Corregido** |
| 10 | **Universidad Industrial de Santander (UIS)** | IES `1204`, NIT `890201213-4` | Código IES `1204` y NIT `890201213-4` coinciden con `uis.edu.co` y el MEN. | IES **`1204`**, NIT `890201213-4`, `uis.edu.co` | `https://uis.edu.co` + `https://www.mineducacion.gov.co` | **Confirmado** |
| 11 | **Universidad Nacional Abierta y a Distancia (UNAD)** | IES `2102`, NIT `860512780-4` | Código IES `2102` y NIT `860512780-4` coinciden con `unad.edu.co` y el MEN. | IES **`2102`**, NIT `860512780-4`, `unad.edu.co` | `https://www.unad.edu.co` + `https://www.mineducacion.gov.co` | **Confirmado** |

---

## 3. Auditoría Detallada de Programas Académicos (33 registros)

### 3.1 Programas con código SNIES individual verificado en fuente primaria oficial (18 programas)

1. **Universidad de Cartagena (`1205`) — `Ingeniería de Sistemas`**: corregido de `9136` a **SNIES `20828`** (verificado en `unicartagena.edu.co`).
2. **Universidad de Cartagena (`1205`) — `Ingeniería Civil`**: corregido de `445` a **SNIES `747`** (verificado en `unicartagena.edu.co`).
3. **Universidad de Cartagena (`1205`) — `Medicina`**: corregido de `449` a **SNIES `737`** (verificado en `unicartagena.edu.co`).
4. **Universidad de Cartagena (`1205`) — `Enfermería`**: corregido de `448` a **SNIES `736`** (verificado en `unicartagena.edu.co`).
5. **Universidad de Cartagena (`1205`) — `Derecho`**: corregido de `442` a **SNIES `740`** (verificado en `unicartagena.edu.co`).
6. **Universidad de Cartagena (`1205`) — `Administración de Empresas`**: corregido de `440` a **SNIES `742`** (verificado en `unicartagena.edu.co`).
7. **Universidad de Cartagena (`1205`) — `Contaduría Pública`**: corregido de `441` a **SNIES `19723`** (verificado en `unicartagena.edu.co`).
8. **Universidad de Cartagena (`1205`) — `Trabajo Social`**: corregido de `452` a **SNIES `739`** (verificado en `unicartagena.edu.co`).
9. **Universidad de Cartagena (`1205`) — `Biología`**: actualizado de `undefined` a **SNIES `90514`** (verificado en `unicartagena.edu.co`, Resolución 000132 de 2024).
10. **Institución Universitaria Mayor de Cartagena (`3103`) — `Ingeniería Informática`**: **SNIES `116700`** verificado directamente en `umayor.edu.co` (reemplazó el registro no verificado `Administración de Empresas` bajo el código falso `2209`).
11. **Universidad Nacional de Colombia (`1101`) — `Ingeniería de Sistemas y Computación`**: corregido de `19` (que en UNAL Bogotá es Administración de Empresas) a **SNIES `106661`** (verificado en `unal.edu.co`).
12. **Universidad Nacional de Colombia (`1101`) — `Arquitectura`**: corregido de `1` a **SNIES `30`** (verificado en `unal.edu.co`).
13. **Universidad Nacional de Colombia (`1101`) — `Diseño Gráfico`**: corregido de `7` (que en UNAL Bogotá es Enfermería) a **SNIES `4`** (verificado en `unal.edu.co`).
14. **Universidad Nacional de Colombia (`1101`) — `Diseño Industrial`**: corregido de `8` a **SNIES `5`** (verificado en `unal.edu.co`).
15. **Universidad del Valle (`1203`) — `Fisioterapia`**: actualizado de `undefined` a **SNIES `568`** (verificado en `univalle.edu.co`).
16. **Universidad Industrial de Santander (`1204`) — `Ingeniería Industrial`**: actualizado de `undefined` a **SNIES `700`** (verificado en `uis.edu.co`).
17. **Universidad Nacional Abierta y a Distancia (`2102`) — `Ingeniería de Sistemas`**: actualizado de `undefined` a **SNIES `2776`** (verificado en `unad.edu.co`).
18. **Universidad Nacional Abierta y a Distancia (`2102`) — `Licenciatura en Lenguas Extranjeras con Énfasis en Inglés`**: actualizado de `undefined` a **SNIES `107200`** (verificado en `unad.edu.co`).

### 3.2 Programas clasificados como Información Oficial Parcial sin código SNIES individual (15 programas)

- **Universidad de Cartagena (`1205`)**: `Economía` (se eliminó el código `443` no confirmado en página primaria de `unicartagena.edu.co`) y `Comunicación Social` (`sniesProgramCode: undefined`, `sourceType: 'institution_website'`).
- **Universidad Tecnológica de Bolívar (`1830`)**: se eliminaron los códigos no verificados `1507`, `1505` y `1504`. Los 7 programas (`Ingeniería de Sistemas`, `Ingeniería Industrial`, `Ingeniería Electrónica`, `Psicología`, `Finanzas y Negocios Internacionales`, `Ingeniería Ambiental`, `Ciencia Política y Relaciones Internacionales`) quedan con `sniesProgramCode: undefined` y `sourceType: 'institution_website'`.
- **Fundación Universitaria Tecnológico Comfenalco**: 3 programas (`Tecnología en Desarrollo de Software`, `Ingeniería de Sistemas`, `Tecnología en Gestión Ambiental Industrial`) vinculados por nombre oficial institucional y clasificados con `sniesProgramCode: undefined` y `sourceType: 'institution_website'`.
- **SENA (`9110`)**: `Tecnología en Análisis y Desarrollo de Software` (`sniesProgramCode: undefined`, `sourceType: 'men_open_data'`).
- **Universidad de Antioquia (`1201`)**: `Ingeniería de Sistemas` (`sniesProgramCode: undefined`, `sourceType: 'institution_website'`; se descartó el código `16925` citado en sitios de terceros al comprobar en `unal.edu.co` que pertenece a UNAL Sede Medellín).
- **Universidad del Norte (`1713`)**: `Negocios Internacionales` (`sniesProgramCode: undefined`, `sourceType: 'institution_website'`).

---

## 4. Correcciones en Reglas de Procedencia y Validación de Código

1. **`SniesNormalizer.ts` y `SniesValidator.ts`**:
   - Ninguna institución sin `sniesInstitutionCode` ni ningún programa sin `sniesCode` puede declararse con `source.type = 'snies'`.
   - `source.provider` preserva fielmente `'institution_website'`, `'men_open_data'`, `'snies'` o `'mock'`.
2. **Filtro `verifiedOnly` (`filterAndSortPrograms.ts`)**:
   - Cuando el usuario activa `"Solo información oficial verificada"`, el filtro exige que el programa posea un código SNIES individual verificado (`Boolean(program.sniesCode)`), devolviendo exactamente los 18 programas completamente verificados y excluyendo los 15 registros parciales.
3. **Transparencia de enlaces en UI (`ProgramCard.tsx` y `ProgramDetailModal.tsx`)**:
   - Cuando la URL oficial del registro corresponde a la raíz del portal institucional `.edu.co` (y no a una URL profunda de programa), los botones muestran explícitamente `"Sitio oficial institucional"` / `"Ir al sitio oficial de la institución →"`.
