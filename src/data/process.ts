export interface ProcessStep {
  number: string;
  title: string;
  body: string;
  icon: string;
}

export interface PhilosophyPrinciple {
  title: string;
  statement: string;
  body: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discover',
    body: 'Map user needs, constraints, and goals. No assumptions — only evidence.',
    icon: 'Search',
  },
  {
    number: '02',
    title: 'Architect',
    body: 'Design systems that scale. Draw the data flow before writing code.',
    icon: 'GitBranch',
  },
  {
    number: '03',
    title: 'Build',
    body: 'Clean, typed, tested code. Ship iteratively — every commit moves forward.',
    icon: 'Code2',
  },
  {
    number: '04',
    title: 'Refine',
    body: 'Profile, benchmark, polish. The gap between good and great is in the details.',
    icon: 'Zap',
  },
];

export const philosophyPrinciples: PhilosophyPrinciple[] = [
  {
    title: 'Systems Over Solutions',
    statement: 'Build the machine that builds the machine.',
    body: 'Composable architectures over one-off fixes. Clean APIs that compound in value.',
  },
  {
    title: 'Clarity Over Cleverness',
    statement: 'Code should read like prose.',
    body: 'Readable over clever, explicit over implicit. If it needs a comment, rewrite it.',
  },
  {
    title: 'Ship, Then Perfect',
    statement: 'Reality beats speculation.',
    body: 'Launch with intention, measure what matters, then polish the details.',
  },
];
