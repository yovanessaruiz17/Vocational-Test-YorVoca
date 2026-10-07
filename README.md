# YorVoca — Orientación Vocacional y Exploración Académica en Colombia

> **Autoría y Desarrollo:** **Yordev**  
> **Tipo de Aplicación:** Progressive Web App (PWA) Offline-First con arquitectura cliente-servidor en React, TypeScript y Express.

---

## Descripción General

**YorVoca** es una plataforma de orientación vocacional y exploración de programas de educación superior en Colombia. Ayuda a estudiantes de educación media y aspirantes universitarios a identificar sus áreas de afinidad vocacional mediante una evaluación multidimensional determinista y a explorar programas e instituciones reales registradas ante el **SNIES / Ministerio de Educación Nacional (MEN)**.

---

## Características Principales

### 1. Contexto del Estudiante (`/onboarding`)
- Captura de ubicación actual y ciudad objetivo de estudio en Colombia (32 departamentos y municipios principales).
- Configuración de flexibilidad geográfica (`solo mi ciudad`, `mi departamento`, `cualquier lugar del país`, `100% virtual`).
- Preferencias de modalidad (`presencial`, `virtual`, `híbrida`, `sin preferencia`) y tipo de institución (`pública`, `privada`, `técnica/tecnológica`, `cualquiera`).

### 2. Test Vocacional Multidimensional (`/test`)
- Evaluación estructurada en **5 bloques** y **8 dimensiones vocacionales**:
  1. Intereses
  2. Aptitudes autopercibidas
  3. Preferencias de entorno de aprendizaje y trabajo
  4. Motivadores vocacionales
  5. Preferencias de exploración
- Persistencia automática del progreso en `localStorage` y validación de integridad de respuestas.

### 3. Motor Determinista de Puntuación y Matching (`/results` y `/careers/:careerId`)
- Cálculo 100% determinista en cliente sin dependencia de servicios externos para obtener resultados.
- Perfilamiento en 8 dimensiones (Creatividad y Expresión, Pensamiento Analítico y Tecnológico, Ciencias y Salud, Liderazgo y Negocios, Impacto Social y Educación, Comunicación y Humanidades, Diseño de Entornos e Ingeniería Física, Investigación y Pensamiento Crítico).
- Catálogo de **47 carreras** agrupadas en **9 familias vocacionales**, con generación de perfil explicativo, fortalezas, rutas de aprendizaje y validación de afinidad.

### 4. Explorador Académico y Trazabilidad SNIES (`/academic`)
- Exploración de instituciones y programas de educación superior en Colombia con trazabilidad de procedencia (`provenance`) y niveles explícitos de verificación (`LEVEL_A_FULL_SNIES`, `LEVEL_B_INSTITUTION_AND_SITE`, `LEVEL_C_INSTITUTION_ONLY`, `UNVERIFIED`, `CONFLICT`).
- Filtros por carrera, relación de afinidad (directa o relacionada), departamento, ciudad, modalidad, sector e institución.
- Separación estricta entre el catálogo verificado (`LocalAcademicProvider` / `AcademicRepository`) y datos de prueba aislados (`MockAcademicProvider`).

### 5. Progressive Web App (PWA) Offline-First
- Instalable en dispositivos móviles y de escritorio mediante `vite-plugin-pwa`.
- Funcionamiento completo del flujo vocacional (Onboarding → Test → Resultados → Explorador Académico local) sin conexión a internet.

---

## Arquitectura del Proyecto

```text
├── docs/                                # Documentación de arquitectura y auditorías de datos (F6A / F6A.1)
├── public/                              # Iconos y recursos estáticos PWA
├── supabase/                            # Esquema PostgreSQL para sincronización académica (F6A)
├── src/
│   ├── components/
│   │   ├── layout/MainLayout.tsx        # Layout principal, navegación y footer (Yordev)
│   │   └── PWAInstallButton.tsx         # Botón de instalación PWA
│   ├── data/
│   │   ├── academic/                    # Catálogo académico colombiano y registros de procedencia
│   │   ├── careers/                     # Catálogo de 47 carreras y 9 familias vocacionales
│   │   ├── assessmentQuestions.ts       # Banco de preguntas del test vocacional
│   │   └── colombiaLocations.ts         # Departamentos y municipios de Colombia
│   ├── features/
│   │   ├── assessment/                  # Flujo interactivo del test vocacional
│   │   ├── careers/                     # Detalle de carrera y perfil vocacional
│   │   ├── institutions/                # Academic Explorer, filtros y tarjetas de instituciones
│   │   ├── onboarding/                  # Captura de contexto del estudiante
│   │   ├── programs/                    # Tarjetas y modal de detalle de programas académicos
│   │   └── results/                     # Página de resultados vocacionales y síntesis
│   ├── hooks/                           # Estado persistente del estudiante (useStudentStore)
│   ├── lib/
│   │   ├── academic/                    # Matcher académico, filtros, mapeo de contexto y validadores
│   │   ├── assessment/                  # Motor determinista de puntuación vocacional
│   │   └── validation/                  # Suites de pruebas automatizadas e invariantes del sistema
│   ├── pages/                           # Páginas de entrada (Landing, AcademicPage)
│   ├── services/
│   │   ├── academic/                    # AcademicRepository, LocalAcademicProvider, ingesta y auditoría
│   │   ├── ai/                          # Cliente y esquemas para interpretación complementaria opcional
│   │   └── snies/                       # Proveedor de compatibilidad SNIES
│   └── types/                           # Contratos TypeScript de dominio vocacional y académico
└── server.ts                            # Servidor Express + Vite middleware y endpoints /api/*
```

---

## Requisitos e Instalación

### Requisitos Previos
- **Node.js** 20+ (o Bun / npm compatible)

### Variables de Entorno
Copia el archivo `.env.example` a `.env` si deseas habilitar funciones opcionales de servidor:

```bash
cp .env.example .env
```

- `GEMINI_API_KEY`: Opcional. Utilizada únicamente en el servidor (`/api/ai/interpret`) para generar una lectura complementaria del perfil vocacional. El cálculo del test y el explorador académico funcionan íntegramente sin esta clave.

### Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# Compilar para producción
npm run build

# Ejecutar verificación de tipos TypeScript
npm run lint

# Ejecutar suite de pruebas y validaciones
npm test
```

---

## Autoría y Créditos

- **Proyecto:** YorVoca
- **Autoría y Desarrollo:** **Yordev**
- **Propósito:** Orientación vocacional accesible, transparente y verificable para estudiantes en Colombia.
