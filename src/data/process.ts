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
    body: 'Deep-dive into the problem space. Map user needs, technical constraints, and business goals. No assumptions — only evidence.',
    icon: 'Search',
  },
  {
    number: '02',
    title: 'Architect',
    body: 'Design systems that scale. Choose technologies deliberately. Draw the data flow before writing a single line of code.',
    icon: 'GitBranch',
  },
  {
    number: '03',
    title: 'Build',
    body: 'Write clean, typed, tested code. Ship iteratively. Every commit moves the product measurably forward.',
    icon: 'Code2',
  },
  {
    number: '04',
    title: 'Refine',
    body: 'Profile, benchmark, and polish. The difference between good and exceptional lives in the details that most people never notice.',
    icon: 'Zap',
  },
];

export const philosophyPrinciples: PhilosophyPrinciple[] = [
  {
    title: 'Systems Over Solutions',
    statement: 'Build the machine that builds the machine.',
    body: 'Individual fixes are temporary. I design composable architectures — clean APIs, typed abstractions, automated pipelines — that compound in value and scale naturally with the team.',
  },
  {
    title: 'Clarity Over Cleverness',
    statement: 'The best code reads like well-written prose.',
    body: 'Constraint breeds creativity. I choose readability over cleverness, explicit over implicit. If a piece of code needs a comment to explain what it does, the code itself should be rewritten.',
  },
  {
    title: 'Ship, Then Perfect',
    statement: 'Feedback from reality beats speculation every time.',
    body: 'Launch with intention, measure what matters, iterate relentlessly. The gap between good and exceptional lives in the details — but only after real users have validated the direction.',
  },
];
