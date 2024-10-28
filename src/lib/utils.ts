import { SchemaType, ValidationError } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitialValue = (schema: any): any => {
  if (Array.isArray(schema)) {
    return [];
  }
  if (typeof schema === 'string') {
    switch (schema) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'date':
        return '';
      case 'string':
        return '';
      default:
        return '';
    }
  }
  if (typeof schema === 'object') {
    return Object.entries(schema).reduce((acc, [key, value]) => {
      acc[key] = getInitialValue(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return '';
};
