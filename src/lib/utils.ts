import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The single class-composition channel for every component in this design system.
 *
 * Two jobs in one call: clsx resolves conditionals and arrays, twMerge resolves
 * Tailwind conflicts so a caller's `className` wins over a component's own default
 * for the same utility, instead of both landing and the cascade deciding.
 *
 * Governance forbids bypassing it. A component that concatenates class strings by
 * hand cannot be restyled from a call site without a specificity fight.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
