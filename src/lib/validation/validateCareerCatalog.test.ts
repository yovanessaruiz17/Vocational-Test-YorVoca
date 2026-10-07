import {
  CAREER_DIMENSION_WEIGHTS,
  CAREER_FAMILIES,
  CAREERS,
  VOCATIONAL_DIMENSIONS,
} from '../../data/careers';
import { validateCareerCatalog } from './validateCareerCatalog';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runCatalogTests(): { passed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;

  // Test 1: Todas las familias tienen ID único y campos válidos
  {
    const ids = CAREER_FAMILIES.map((f) => f.id);
    const uniqueIds = new Set(ids);
    assert(
      ids.length === uniqueIds.size && ids.length >= 12,
      `Expected >= 12 unique career families, got ${uniqueIds.size}`
    );
    passed++;
    results.push(`PASS [1/10]: Todas las familias (${ids.length}) tienen ID único.`);
  }

  // Test 2: Todas las dimensiones tienen ID único y cubren las 4 categorías
  {
    const ids = VOCATIONAL_DIMENSIONS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    assert(
      ids.length === uniqueIds.size && ids.length >= 48,
      `Expected unique vocational dimensions, got ${uniqueIds.size}/${ids.length}`
    );
    const categories = new Set(VOCATIONAL_DIMENSIONS.map((d) => d.category));
    assert(
      categories.has('interest') &&
        categories.has('aptitude') &&
        categories.has('work_preference') &&
        categories.has('motivator'),
      'Missing one of the 4 dimension categories'
    );
    passed++;
    results.push(
      `PASS [2/10]: Todas las dimensiones (${ids.length}) tienen ID único y cubren las 4 categorías.`
    );
  }

  // Test 3: Todas las carreras tienen ID único y campos completos
  {
    const ids = CAREERS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    assert(
      ids.length === uniqueIds.size && ids.length >= 40,
      `Expected unique careers, got ${uniqueIds.size}/${ids.length}`
    );
    passed++;
    results.push(`PASS [3/10]: Todas las carreras (${ids.length}) tienen ID único.`);
  }

  // Test 4: Todas las carreras apuntan a una familia existente
  {
    const familyIdSet = new Set(CAREER_FAMILIES.map((f) => f.id));
    const invalidCareers = CAREERS.filter((c) => !familyIdSet.has(c.familyId));
    assert(
      invalidCareers.length === 0,
      `Found careers with non-existent familyId: ${invalidCareers.map((c) => c.id).join(', ')}`
    );
    passed++;
    results.push('PASS [4/10]: Todas las carreras apuntan a una familia existente.');
  }

  // Test 5: Todos los pesos apuntan a dimensiones y carreras existentes
  {
    const dimensionIdSet = new Set(VOCATIONAL_DIMENSIONS.map((d) => d.id));
    const careerIdSet = new Set(CAREERS.map((c) => c.id));
    const brokenDimensionWeights = CAREER_DIMENSION_WEIGHTS.filter(
      (w) => !dimensionIdSet.has(w.dimensionId)
    );
    const brokenCareerWeights = CAREER_DIMENSION_WEIGHTS.filter(
      (w) => !careerIdSet.has(w.careerId)
    );
    assert(
      brokenDimensionWeights.length === 0,
      `Found weights pointing to non-existent dimensions`
    );
    assert(
      brokenCareerWeights.length === 0,
      `Found weights pointing to non-existent careers`
    );
    passed++;
    results.push(
      `PASS [5/10]: Todos los pesos (${CAREER_DIMENSION_WEIGHTS.length}) apuntan a dimensiones y carreras existentes.`
    );
  }

  // Test 6: Todos los pesos están entre 0 y 1 y normalizados
  {
    const allowed = new Set([0, 0.25, 0.5, 0.75, 1]);
    const outOfRange = CAREER_DIMENSION_WEIGHTS.filter(
      (w) => w.weight < 0 || w.weight > 1 || !allowed.has(w.weight)
    );
    assert(
      outOfRange.length === 0,
      `Found out-of-range or unnormalized weights: ${outOfRange.length}`
    );
    passed++;
    results.push('PASS [6/10]: Todos los pesos están entre 0 y 1 en la escala normalizada.');
  }

  // Test 7: No existen referencias rotas en relatedDimensions ni discrepancias con weights
  {
    const validation = validateCareerCatalog();
    assert(
      validation.isValid && validation.issues.length === 0,
      `Expected 0 catalog validation issues, got: ${JSON.stringify(validation.issues)}`
    );
    passed++;
    results.push(
      'PASS [7/10]: No existen referencias rotas ni discrepancias entre relatedDimensions y careerDimensionWeights.'
    );
  }

  // Test 8: El catálogo puede cargarse sin errores y todas las familias tienen al menos 2 carreras
  {
    for (const family of CAREER_FAMILIES) {
      const count = CAREERS.filter((c) => c.familyId === family.id).length;
      assert(
        count >= 2,
        `Family "${family.id}" should have at least 2 careers, found ${count}`
      );
    }
    passed++;
    results.push(
      'PASS [8/10]: El catálogo carga sin errores y las 12 familias profesionales cuentan con carreras representativas.'
    );
  }

  // Test 9: Detección efectiva de errores (IDs duplicados, pesos fuera de rango, familias inexistentes)
  {
    const brokenResult = validateCareerCatalog({
      families: [
        ...CAREER_FAMILIES,
        { id: 'technology', name: '', description: 'Duplicada y sin nombre' },
      ],
      careers: [
        ...CAREERS,
        {
          id: 'fake_career',
          name: 'Carrera Prueba',
          normalizedName: 'carrera prueba',
          familyId: 'non_existent_family',
          shortDescription: 'Descripción',
          whatYouDo: ['Actividad'],
          typicalAreas: ['Área'],
          relatedDimensions: ['non_existent_dimension'],
        },
      ],
      weights: [
        ...CAREER_DIMENSION_WEIGHTS,
        { careerId: 'engineering_software', dimensionId: 'technology', weight: 1.5 },
      ],
    });
    assert(!brokenResult.isValid, 'Expected broken catalog to fail validation');
    const codes = new Set(brokenResult.issues.map((i) => i.code));
    assert(codes.has('DUPLICATE_FAMILY_ID'), 'Should detect DUPLICATE_FAMILY_ID');
    assert(codes.has('EMPTY_FAMILY_NAME'), 'Should detect EMPTY_FAMILY_NAME');
    assert(
      codes.has('NON_EXISTENT_CAREER_FAMILY'),
      'Should detect NON_EXISTENT_CAREER_FAMILY'
    );
    assert(
      codes.has('BROKEN_RELATED_DIMENSION_REFERENCE'),
      'Should detect BROKEN_RELATED_DIMENSION_REFERENCE'
    );
    assert(codes.has('WEIGHT_OUT_OF_RANGE'), 'Should detect WEIGHT_OUT_OF_RANGE');
    passed++;
    results.push(
      'PASS [9/10]: validateCareerCatalog() detecta correctamente IDs duplicados, nombres vacíos, familias inexistentes, dimensiones rotas y pesos fuera de rango.'
    );
  }

  // Test 10: Diferenciación de perfiles entre carreras
  {
    const duplicateProfileResult = validateCareerCatalog({
      careers: [
        CAREERS[0],
        {
          ...CAREERS[0],
          id: 'cloned_career',
          name: 'Clon Exacto',
          normalizedName: 'clon exacto',
        },
      ],
      weights: [
        ...CAREER_DIMENSION_WEIGHTS.filter((w) => w.careerId === CAREERS[0].id),
        ...CAREER_DIMENSION_WEIGHTS.filter((w) => w.careerId === CAREERS[0].id).map(
          (w) => ({
            ...w,
            careerId: 'cloned_career',
          })
        ),
      ],
    });
    assert(
      duplicateProfileResult.issues.some((i) => i.code === 'IDENTICAL_CAREER_PROFILES'),
      'Should detect IDENTICAL_CAREER_PROFILES'
    );
    passed++;
    results.push(
      'PASS [10/10]: Diferenciación verificada (ningún par de carreras en el catálogo comparte el mismo vector de pesos).'
    );
  }

  return { passed, results };
}

// Run if executed directly via tsx
const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.includes('validateCareerCatalog.test');

if (isDirectRun) {
  const { passed, results } = runCatalogTests();
  for (const line of results) {
    console.log(line);
  }
  console.log(`\nTotal: ${passed}/10 tests ejecutados con éxito.`);
}
