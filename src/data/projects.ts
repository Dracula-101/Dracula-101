import { VARIANT } from './variant';

export interface ProjectStat {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  descriptor: string;
  category: string;
  year: string;
  period: string;
  tech: string[];
  description: string;
  highlights: string[];
  stats: ProjectStat[];
  color: string;
  gradient: string;
  github?: string;
  demo?: string;
}

const all: Record<string, Omit<Project, 'index'>> = {
  visionx: {
    id: 'visionx',
    title: 'VisionX',
    descriptor: 'AI Log-Triage Platform',
    category: 'Distributed Systems · AI Agents',
    year: '2026',
    period: 'May 2026 — Aug 2026',
    tech: ['Python', 'FastAPI', 'Kafka', 'PostgreSQL', 'Redis', 'Drain3', 'scikit-learn', 'UMAP', 'HDBSCAN', 'LangGraph', 'Prometheus', 'Grafana', 'Docker', 'React'],
    description: 'VisionX is the AI log-triage platform I built at Visa for the ATM monitoring team. It handles ~1M logs/hour: logs from APIs, CSV, and JSON are templated with Drain3, classified once per template by a frozen-embedding model with LLM escalation, and clustered into deduplicated issues with server-side P0–P3 priority. A risk engine scores each source for outage risk, and a LangGraph agent picks up P0 issues, clones the failing repo, and ships the fix as a GitHub pull request with a Jira comment through an internal MCP hub.',
    highlights: [
      'Drain3 templating plus a 20-class frozen-embedding classifier (82% F1 on a 10K-sample evaluation) with LLM escalation on low confidence',
      'Two-pass HDBSCAN/UMAP clustering condensed ~30K templates from a week of logs into ~200 ranked, deduplicated issues',
      'Fault-tolerant FastAPI + Kafka pipeline: 9 topics, retry backoff, dead-letter queue, PostgreSQL with connection pooling, Redis/SQLite caches',
      'LangGraph ReAct remediation agent auto-dispatched on P0 issues; its fixes for real issues were merged',
      'Backfilled logs (600s+ lag) are kept out of live Prometheus counters and Alertmanager rules, so on-call only gets real alerts',
      'Cut issue triage time 50–60% versus manual Splunk and Grafana searches; demoed live to VP-level leadership',
    ],
    stats: [
      { value: '~1M', label: 'Logs / Hour' },
      { value: '82%', label: 'Classifier F1' },
      { value: '30K→200', label: 'Templates → Issues' },
      { value: '50–60%', label: 'Triage Time Cut' },
    ],
    color: '#3B82F6',
    gradient: 'from-blue-900/20 to-transparent',
  },
  pivot: {
    id: 'pivot',
    title: 'Pivot',
    descriptor: 'Agentic RL Research',
    category: 'Systems · Reinforcement Learning',
    year: '2026',
    period: 'May 2026 — Present',
    tech: ['Rust', 'Python', 'Firecracker', 'MLX', 'LoRA'],
    description: "Pivot is a reinforcement learning system that gives coding agents step-level credit. Instead of one reward per task, it forks the agent's sandbox mid-task and measures how each action changes the chance of success. Underneath is a Rust fork runtime for Firecracker microVMs that clones a running VM in milliseconds. Laptop-scale pilot, one seed.",
    highlights: [
      'Rust fork runtime for Firecracker microVMs with a userfaultfd page server, huge pages, and copy-on-write disks',
      'Clones a running VM 16 ways in 262ms and restores agent state 13x faster than Docker replay (208ms vs. 2.7s)',
      'Cut 16-clone parallel test runs from 53s to 715ms (74x) with on-demand memory paging and idle-VM pausing',
      'Fork-based step credit is 2x more accurate than GRPO and 4x more than a frozen 3B LLM critic, measured against a brute-force oracle',
      "Raised a 1.5B coding model's held-out success to 62% vs. 27% for GRPO at equal compute, using LoRA fine-tuning",
    ],
    stats: [
      { value: '262ms', label: '16-Way VM Fork' },
      { value: '13x', label: 'Faster Than Docker' },
      { value: '74x', label: 'Parallel Test Speedup' },
      { value: '62%', label: 'vs 27% GRPO' },
    ],
    color: '#EF4444',
    gradient: 'from-red-900/20 to-transparent',
  },
  echo: {
    id: 'echo',
    title: 'Echo',
    descriptor: 'Real-Time Chat Platform',
    category: 'Distributed Systems · Real-Time',
    year: '2025',
    period: 'Mar 2025 — Sept 2025',
    tech: ['Go', 'Kafka', 'PostgreSQL', 'Redis', 'WebSockets', 'React', 'Docker', 'Kotlin'],
    description: 'Echo is a live chat and video-call app: 8 Go microservices, a React web client, and a native Android client. It runs as 14 Docker containers in ~500 MB of RAM on a self-hosted VM behind a Cloudflare Tunnel, with health-gated deploys that roll back automatically.',
    highlights: [
      '8 Go microservices (auth, user, message, ws, presence, media, location, API gateway) on PostgreSQL, Redis, and Kafka',
      'Horizontally scalable WebSockets on Redis pub/sub, holding 10K+ live connections at sub-10ms latency (k6 load test)',
      'Gap-free, duplicate-free delivery with Kafka, per-chat sequence numbers, resume tokens, and Redis idempotency keys',
      'Production behind a Cloudflare Tunnel with zero open ports, container health checks, and auto-rollback of failed deploys',
      'PostgreSQL schema of 124 tables with 195 row-level security policies; ~2 ms server-side API latency',
    ],
    stats: [
      { value: '8', label: 'Go Microservices' },
      { value: '10K+', label: 'Live Connections' },
      { value: '<10ms', label: 'Latency' },
      { value: '~500MB', label: 'Total RAM' },
    ],
    color: '#F5A623',
    gradient: 'from-amber-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/echo-backend',
    demo: 'https://web.echo-app.net/',
  },
  sync: {
    id: 'sync',
    title: 'Sync',
    descriptor: 'Social Media Platform',
    category: 'Backend · Cross-Platform',
    year: '2025',
    period: 'Apr 2025 — Apr 2026',
    tech: ['Go', 'Gin', 'MongoDB', 'PostgreSQL', 'Redis', 'React', 'TypeScript', 'Flutter'],
    description: 'A Reddit-style social platform with a Go backend, a React web client, and a Flutter mobile client: communities, posts, nested comments, voting, and a follower graph.',
    highlights: [
      'Go + Gin backend with 80+ REST endpoints across auth, users, posts, comments, communities, and moderation',
      'JWT with refresh tokens, Google OAuth, multi-device sessions, and per-IP and per-user rate limiting in Redis',
      'Polyglot persistence: MongoDB for content, PostgreSQL for geo queries, Redis for caching and real-time feed updates',
      'React + TypeScript web client (Zustand, React Hook Form, Zod) and a Flutter client for Android and iOS',
    ],
    stats: [
      { value: '80+', label: 'API Endpoints' },
      { value: '3', label: 'Databases' },
      { value: '2', label: 'Clients' },
      { value: '130', label: 'Backend Commits' },
    ],
    color: '#6366F1',
    gradient: 'from-indigo-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Sync',
  },
  jetscan: {
    id: 'jetscan',
    title: 'JetScan',
    descriptor: 'Android Document Scanner',
    category: 'Android · Computer Vision',
    year: '2024',
    period: 'May 2024 — Nov 2024',
    tech: ['Kotlin', 'Jetpack Compose', 'CameraX', 'OpenCV', 'Room', 'Document AI', 'Firebase'],
    description: 'An open-source Android document scanner: 35K+ lines of Kotlin in Jetpack Compose (MVVM) with a CameraX preview and an OpenCV detection pipeline, plus Google Document AI OCR and a Flask PDF service on Cloud Run.',
    highlights: [
      '100ms angle-invariant document detection using LAB color space, Canny, HoughLinesP, and contour analysis',
      'Room DAO relations across documents, pages, and folders; perspective correction; PDF, JPEG, and PNG export',
      'Google Document AI OCR and a Flask PDF service on Cloud Run for split, merge, encrypt, and compression',
      'Firebase Auth with cloud document sync',
      'JUnit, MockK, and Espresso tests for camera and scanning flows in a GitHub Actions release pipeline',
    ],
    stats: [
      { value: '35K+', label: 'Lines of Kotlin' },
      { value: '100ms', label: 'Detection' },
      { value: '3', label: 'Export Formats' },
      { value: 'OCR', label: 'Document AI' },
    ],
    color: '#10B981',
    gradient: 'from-emerald-900/20 to-transparent',
    github: 'https://github.com/JetScan-Technologies/jetscan-android',
  },
  nesters: {
    id: 'nesters',
    title: 'Nesters',
    descriptor: 'Student Housing App',
    category: 'Flutter · Cross-Platform',
    year: '2024',
    period: 'May 2024 — Jan 2025',
    tech: ['Flutter', 'Dart', 'Firebase', 'Supabase', 'Node.js', 'GCP'],
    description: 'A student-housing app I co-founded and shipped to Google Play and the App Store: roommate matching, real-time chat, and a buy, sell, and rent marketplace.',
    highlights: [
      'Shipped to Google Play and the App Store, owning the lifecycle from schema design to store submission',
      'Real-time chat on a Node.js WebSocket service on GCP with FCM push notifications, designed for 50K concurrent users',
      'Preference-based roommate matching on lifestyle, schedule, budget, and location',
      'Supabase marketplace with structured listings, image uploads, and filters by price, location, and amenities',
    ],
    stats: [
      { value: '2', label: 'App Stores' },
      { value: '50K', label: 'Concurrent Users (Design)' },
      { value: 'RT', label: 'Chat + FCM' },
      { value: '3', label: 'Backends' },
    ],
    color: '#EC4899',
    gradient: 'from-pink-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Nesters',
  },
  skycast: {
    id: 'skycast',
    title: 'Skycast',
    descriptor: 'Material 3 Weather App',
    category: 'Android · Jetpack Compose',
    year: '2025',
    period: 'Aug 2025',
    tech: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Retrofit', 'Room', 'Hilt', 'Coroutines'],
    description: 'A Jetpack Compose weather app with 10-day forecasts, hourly air quality, and weather news from 4 API providers, built on clean architecture with one-way data flow.',
    highlights: [
      'Clean architecture (core, data, domain, presentation) with a BaseViewModel(State, Event, Action) for one-way data flow',
      'Typed Retrofit Result call adapter over 4 providers: WeatherAPI, Visual Crossing, Open-Meteo, and NewsAPI',
      'GPS location, city search, and saved cities in Room; persisted metric and imperial preferences',
      'Material You dynamic color with day/night theming; Navigation Compose, Lottie animations, and Coil',
    ],
    stats: [
      { value: '4', label: 'API Providers' },
      { value: '10', label: 'Day Forecast' },
      { value: 'AQI', label: 'Hourly' },
      { value: 'M3', label: 'Material You' },
    ],
    color: '#38BDF8',
    gradient: 'from-sky-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Skycast',
  },
};

/* Android framing of Echo: the Kotlin client is the story. */
const androidEcho: Partial<Project> = {
  descriptor: 'Real-Time Chat App · Android',
  category: 'Android · Real-Time',
  tech: ['Kotlin', 'Jetpack Compose', 'Hilt', 'Room', 'Coroutines/Flow', 'WebSockets', 'FCM', 'Go'],
  description: 'Echo is a live chat app with a native Android client in Kotlin and Jetpack Compose. The client is 11 Gradle modules on MVI and Hilt, with a 50+ component design system, a custom WebSocket engine, and offline-first sync to a Go backend of 8 microservices.',
  highlights: [
    'Kotlin/Compose client in 11 Gradle modules with convention plugins: MVI, Hilt, Room, and Coroutines/Flow',
    'Compose design system of 50+ reusable, themeable components with adaptive phone and tablet layouts',
    'Custom WebSocket engine with heartbeats, jittered exponential backoff, and delivery and read receipts for a 10K+-connection backend',
    '4 custom Lint rules (theming, hardcoded strings, memory leaks, security) plus JUnit, MockK, and Espresso tests',
    'FCM notifications with inline actions, encrypted local storage, and offline-first sync to the Go backend',
  ],
  stats: [
    { value: '11', label: 'Gradle Modules' },
    { value: '50+', label: 'Compose Components' },
    { value: '4', label: 'Custom Lint Rules' },
    { value: '10K+', label: 'Backend Connections' },
  ],
  github: 'https://github.com/Dracula-101/echo-android',
};

const order = {
  swe: ['pivot', 'visionx', 'echo', 'sync'], // most recent first
  android: ['echo', 'jetscan', 'skycast', 'nesters'],
}[VARIANT];

export const projects: Project[] = order.map((id, i) => ({
  ...all[id],
  ...(VARIANT === 'android' && id === 'echo' ? androidEcho : {}),
  index: String(i + 1).padStart(2, '0'),
}));
