import { LikertValue } from '../../types/assessment';

export function isValidLikertValue(value: number): value is LikertValue {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Invierte el valor de una respuesta en escala Likert 1..5:
 * 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
 */
export function reverseLikertScore(value: number): LikertValue {
  if (!isValidLikertValue(value)) {
    throw new Error(`Valor Likert fuera de rango (debe ser entero entre 1 y 5): ${String(value)}`);
  }
  return (6 - value) as LikertValue;
}

/**
 * Normaliza una respuesta Likert (1..5) al intervalo [0, 1] usando:
 * normalized = (effectiveValue - 1) / 4
 * Si reverseScored === true, invierte primero el valor Likert.
 */
export function normalizeLikertAnswer(value: number, reverseScored = false): number {
  if (!isValidLikertValue(value)) {
    throw new Error(`Valor Likert fuera de rango (debe ser entero entre 1 y 5): ${String(value)}`);
  }
  const effectiveValue = reverseScored ? reverseLikertScore(value) : value;
  return (effectiveValue - 1) / 4;
}
