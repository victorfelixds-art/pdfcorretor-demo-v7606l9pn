import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function parseCurrency(value: string) {
  return Number(value.replace(/[^0-9,-]+/g, '').replace(',', '.'))
}

export function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function generateUUID() {
  return (
    'gen-' +
    Math.random().toString(16).substring(2, 6) +
    '-' +
    Math.random().toString(16).substring(2, 6)
  )
}
