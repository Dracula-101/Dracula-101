export interface Stat {
  value: number;
  suffix: string;
  label: string;
  direction: 'left' | 'top' | 'right' | 'scale' | 'bottom' | 'skew';
}

export const stats: Stat[] = [
  { value: 5, suffix: '+', label: 'Full-Stack Projects', direction: 'left' },
  { value: 9, suffix: '', label: 'Microservices Built', direction: 'top' },
  { value: 40, suffix: '+', label: 'API Endpoints', direction: 'right' },
  { value: 3, suffix: '', label: 'Research Papers', direction: 'scale' },
  { value: 6, suffix: '', label: 'Database Technologies', direction: 'bottom' },
  { value: 3, suffix: '', label: 'Mobile Platforms', direction: 'skew' },
];
