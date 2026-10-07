import { VOCATIONAL_DIMENSIONS } from '../../data/careers';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import {
  AssessmentAnswer,
  Question,
  QuestionValidationIssue,
  QuestionValidationResult,
} from '../../types/assessment';
import { DimensionCategory, VocationalDimension } from '../../types/career';
import { isValidLikertValue } from '../assessment/normalizeAnswer';

const VALID_CATEGORIES = new Set<DimensionCategory>([
  'interest',
  'aptitude',
  'work_preference',
  'motivator',
]);

export interface ValidateAssessmentQuestionsInput {
  questions?: Question[];
  dimensions?: VocationalDimension[];
  answersToValidate?: AssessmentAnswer[];
}

export function validateAssessmentQuestions(
  input: ValidateAssessmentQuestionsInput = {}
): QuestionValidationResult {
  const questions = input.questions ?? ASSESSMENT_QUESTIONS;
  const dimensions = input.dimensions ?? VOCATIONAL_DIMENSIONS;
  const answersToValidate = input.answersToValidate ?? [];

  const issues: QuestionValidationIssue[] = [];

  const dimensionsById = new Map<string, VocationalDimension>();
  for (const dim of dimensions) {
    dimensionsById.set(dim.id, dim);
  }

  const seenIds = new Set<string>();
  const seenNormalizedTexts = new Set<string>();
  const uniqueDimensions = new Set<string>();

  const byCategory: Record<DimensionCategory, number> = {
    interest: 0,
    aptitude: 0,
    work_preference: 0,
    motivator: 0,
  };

  let reverseScoredCount = 0;

  if (questions.length === 0) {
    issues.push({
      code: 'EMPTY_QUESTION_BANK',
      severity: 'error',
      message: 'El banco de preguntas está vacío.',
    });
  }

  for (const question of questions) {
    // 1. Validar ID
    if (!question.id || !question.id.trim()) {
      issues.push({
        code: 'EMPTY_QUESTION_ID',
        severity: 'error',
        message: 'Existe una pregunta con ID vacío.',
      });
    } else if (seenIds.has(question.id)) {
      issues.push({
        code: 'DUPLICATE_QUESTION_ID',
        severity: 'error',
        message: `ID de pregunta duplicado: "${question.id}".`,
        questionId: question.id,
      });
    } else {
      seenIds.add(question.id);
    }

    // 2. Validar texto y duplicados de texto
    if (!question.text || !question.text.trim()) {
      issues.push({
        code: 'EMPTY_QUESTION_TEXT',
        severity: 'error',
        message: `La pregunta "${question.id}" tiene el texto vacío.`,
        questionId: question.id,
      });
    } else {
      const normalizedText = question.text.trim().toLowerCase();
      if (seenNormalizedTexts.has(normalizedText)) {
        issues.push({
          code: 'DUPLICATE_QUESTION_TEXT',
          severity: 'error',
          message: `La pregunta "${question.id}" tiene un enunciado duplicado.`,
          questionId: question.id,
        });
      } else {
        seenNormalizedTexts.add(normalizedText);
      }
    }

    // 3. Validar dimensionId y correspondencia de categoría
    if (!question.dimensionId || !question.dimensionId.trim()) {
      issues.push({
        code: 'EMPTY_DIMENSION_ID',
        severity: 'error',
        message: `La pregunta "${question.id}" no tiene dimensionId asignado.`,
        questionId: question.id,
      });
    } else {
      const targetDim = dimensionsById.get(question.dimensionId);
      if (!targetDim) {
        issues.push({
          code: 'NON_EXISTENT_DIMENSION_ID',
          severity: 'error',
          message: `La pregunta "${question.id}" apunta a una dimensión inexistente: "${question.dimensionId}".`,
          questionId: question.id,
        });
      } else {
        uniqueDimensions.add(question.dimensionId);
        if (targetDim.category !== question.category) {
          issues.push({
            code: 'MISMATCHED_DIMENSION_CATEGORY',
            severity: 'error',
            message: `La pregunta "${question.id}" tiene categoría "${question.category}", pero la dimensión "${question.dimensionId}" pertenece a "${targetDim.category}".`,
            questionId: question.id,
          });
        }
      }
    }

    // 4. Validar categoría
    if (!VALID_CATEGORIES.has(question.category)) {
      issues.push({
        code: 'INVALID_QUESTION_CATEGORY',
        severity: 'error',
        message: `La pregunta "${question.id}" tiene una categoría no válida: "${String(question.category)}".`,
        questionId: question.id,
      });
    } else {
      byCategory[question.category] += 1;
    }

    // 5. Validar configuración de obligatoriedad (required)
    if (typeof question.required !== 'boolean' || question.required !== true) {
      issues.push({
        code: 'INVALID_REQUIRED_FLAG',
        severity: 'error',
        message: `La pregunta "${question.id}" tiene una configuración inválida en 'required' (todas las preguntas del test vocacional deben ser obligatorias).`,
        questionId: question.id,
      });
    }

    // 6. Validar opciones de respuesta
    if (!Array.isArray(question.options) || question.options.length === 0) {
      issues.push({
        code: 'EMPTY_QUESTION_OPTIONS',
        severity: 'error',
        message: `La pregunta "${question.id}" no tiene opciones de respuesta.`,
        questionId: question.id,
      });
    } else {
      if (question.options.length !== 5) {
        issues.push({
          code: 'INVALID_OPTIONS_COUNT',
          severity: 'error',
          message: `La pregunta "${question.id}" debe tener exactamente 5 opciones Likert, pero tiene ${question.options.length}.`,
          questionId: question.id,
        });
      }

      const optionValues = new Set<number>();
      for (const opt of question.options) {
        if (!isValidLikertValue(opt.value)) {
          issues.push({
            code: 'OPTION_VALUE_OUT_OF_RANGE',
            severity: 'error',
            message: `La pregunta "${question.id}" contiene una opción con valor fuera de rango [1..5]: ${String(opt.value)}.`,
            questionId: question.id,
          });
        } else if (optionValues.has(opt.value)) {
          issues.push({
            code: 'DUPLICATE_OPTION_VALUE',
            severity: 'error',
            message: `La pregunta "${question.id}" repite el valor de opción ${opt.value}.`,
            questionId: question.id,
          });
        } else {
          optionValues.add(opt.value);
        }

        if (!opt.label || !opt.label.trim()) {
          issues.push({
            code: 'EMPTY_OPTION_LABEL',
            severity: 'error',
            message: `La pregunta "${question.id}" tiene una opción sin etiqueta de texto.`,
            questionId: question.id,
          });
        }
      }
    }

    if (question.reverseScored) {
      reverseScoredCount += 1;
    }
  }

  // 7. Validar respuestas suministradas si las hay
  for (const ans of answersToValidate) {
    if (!seenIds.has(ans.questionId)) {
      issues.push({
        code: 'ANSWER_UNKNOWN_QUESTION',
        severity: 'error',
        message: `Respuesta asociada a una pregunta inexistente: "${ans.questionId}".`,
        questionId: ans.questionId,
      });
    }
    if (!isValidLikertValue(ans.value)) {
      issues.push({
        code: 'ANSWER_OUT_OF_RANGE',
        severity: 'error',
        message: `Respuesta fuera del rango Likert [1..5] en "${ans.questionId}": ${String(ans.value)}.`,
        questionId: ans.questionId,
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    stats: {
      totalQuestions: questions.length,
      byCategory,
      uniqueDimensionsCovered: uniqueDimensions.size,
      reverseScoredCount,
    },
  };
}
