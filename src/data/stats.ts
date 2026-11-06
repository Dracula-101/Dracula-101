import { pick } from './variant';

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  direction: 'left' | 'top' | 'right' | 'scale' | 'bottom' | 'skew';
}

export const stats: Stat[] = pick<Stat[]>({
  swe: [
    { value: 1, suffix: 'M', label: 'Logs / Hour Triaged', direction: 'left' },
    { value: 10, suffix: 'K+', label: 'Live WebSocket Connections', direction: 'top' },
    { value: 8, suffix: '', label: 'Go Microservices', direction: 'right' },
    { value: 74, suffix: 'x', label: 'Faster Parallel VM Runs', direction: 'scale' },
    { value: 60, suffix: '%', label: 'Triage Time Cut (up to)', direction: 'bottom' },
    { value: 4, suffix: '', label: 'Research Papers', direction: 'skew' },
  ],
  android: [
    { value: 11, suffix: '', label: 'Gradle Modules', direction: 'left' },
    { value: 50, suffix: '+', label: 'Compose Components', direction: 'top' },
    { value: 35, suffix: 'K+', label: 'Lines of Kotlin', direction: 'right' },
    { value: 550, suffix: '+', label: 'Store Downloads', direction: 'scale' },
    { value: 100, suffix: 'ms', label: 'Document Detection', direction: 'bottom' },
    { value: 566, suffix: '%', label: 'Faster BLE Transfer', direction: 'skew' },
  ],
});
