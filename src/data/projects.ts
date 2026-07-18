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

export const projects: Project[] = [
  {
    id: 'visionx',
    index: '01',
    title: 'VisionX',
    descriptor: 'Autonomous Log-Triage Platform',
    category: 'Distributed Systems · AI Agents',
    year: '2026',
    period: 'May 2026 — Present',
    tech: ['Python', 'FastAPI', 'Kafka', 'PostgreSQL', 'Redis', 'Drain3', 'scikit-learn', 'UMAP', 'HDBSCAN', 'LangGraph', 'Prometheus', 'Grafana', 'Docker'],
    description: 'VisionX is a production log-triage platform built at Visa that turns noisy application logs into ranked, actionable incidents. Logs from APIs, CSV, and JSON are templated with Drain3, embedded, classified with a frozen-embedding model, and clustered into issues with UMAP + HDBSCAN. Each issue is scored for risk against seasonal baselines, and a two-stage LangGraph agent can read the offending repo, propose a fix, and ship it as a GitHub PR and Jira comment through the Visa MCP Hub.',
    highlights: [
      'Hybrid ingestion pipeline: Drain3 template mining plus a frozen-embedding scikit-learn classifier surfaces actionable error patterns instead of raw log counts',
      'UMAP + HDBSCAN auto-clustering with LLM-generated umbrella labels groups related errors into deduplicated issues, tracking regressions and resurfaced problems',
      'Seasonal day-of-week × hour baselines separate live traffic bursts from historic batch backfills, so Prometheus + Alertmanager only fire on genuine anomalies',
      'Two-stage ReAct agent (fast triage → deep reasoning) reads the repo, edits files, and autonomously opens a GitHub PR and Jira comment via the Visa MCP Hub',
      'Modular FastAPI backend — a Kafka/Postgres event pipeline, Redis caching, a FastMCP server, and a Docker-composed observability stack (Prometheus, Alertmanager, Grafana)',
    ],
    stats: [
      { value: '3', label: 'Ingest Formats' },
      { value: 'RT', label: 'Log Triage' },
      { value: 'AI', label: 'Auto-Fix Agent' },
      { value: 'PR', label: 'GitHub + Jira' },
    ],
    color: '#3B82F6',
    gradient: 'from-blue-900/20 to-transparent',
  },
  {
    id: 'echo',
    index: '02',
    title: 'Echo',
    descriptor: 'Real-Time Messaging Platform',
    category: 'Full-Stack · Distributed Systems',
    year: '2025',
    period: 'Sept 2025 — Present',
    tech: ['Go', 'WebSockets', 'Kafka', 'PostgreSQL', 'Redis', 'TimescaleDB', 'Android', 'Kotlin'],
    description: 'A production-grade real-time messaging platform engineered around 9 independent microservices. WhatsApp-inspired UX with end-to-end message delivery guarantees, multi-device sync, and sub-100ms latency at scale.',
    highlights: [
      '9 independent Go microservices with clean separation of concerns',
      'WebSocket-based real-time messaging with sub-100ms latency',
      'Multi-device session synchronization via event-driven architecture',
      'Event sourcing pipeline with Kafka for message delivery guarantees',
      'TimescaleDB for message history analytics and time-series queries',
    ],
    stats: [
      { value: '9', label: 'Microservices' },
      { value: '<100ms', label: 'Latency' },
      { value: '5', label: 'Databases' },
      { value: '∞', label: 'Scale Target' },
    ],
    color: '#F5A623',
    gradient: 'from-amber-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Echo',
  },
  {
    id: 'sync',
    index: '03',
    title: 'Sync',
    descriptor: 'Social Media Ecosystem',
    category: 'Full-Stack · Cross-Platform',
    year: '2025',
    period: 'Jan 2025 — Jun 2025',
    tech: ['Go', 'React', 'Kotlin', 'MongoDB', 'PostgreSQL', 'Redis', 'TypeScript'],
    description: 'A Reddit-inspired social platform spanning Android, Web, and a Go backend. Communities, posts, comments, upvote graphs, and a follower graph — 40+ API endpoints, real-time feed updates, and a recommendation engine.',
    highlights: [
      '40+ documented REST API endpoints with comprehensive test coverage',
      'Cross-platform experience: native Android + React web client',
      'Community-driven content graph with upvotes and follower system',
      'Real-time feed updates powered by Redis pub/sub',
      'Hybrid MongoDB + PostgreSQL storage for optimal query patterns',
    ],
    stats: [
      { value: '40+', label: 'API Endpoints' },
      { value: '3', label: 'Platforms' },
      { value: '2', label: 'Databases' },
      { value: 'RT', label: 'Real-time' },
    ],
    color: '#6366F1',
    gradient: 'from-indigo-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Sync',
  },
  {
    id: 'jetscan',
    index: '04',
    title: 'JetScan',
    descriptor: 'Intelligent Document Scanner',
    category: 'Android · Computer Vision',
    year: '2024',
    period: 'May 2024 — Nov 2024',
    tech: ['Kotlin', 'OpenCV', 'Google Document AI', 'Firebase', 'Android'],
    description: 'A native Android document scanning application with OpenCV-powered edge detection and perspective correction. Integrates Google Document AI for OCR, structured data extraction, and intelligent document classification.',
    highlights: [
      'Real-time edge detection using OpenCV with perspective correction',
      'Google Document AI OCR pipeline for structured data extraction',
      'Multi-format export supporting PDF, JPEG, and PNG outputs',
      'Firebase authentication with secure cloud document sync',
      'Intelligent document classification using ML models',
    ],
    stats: [
      { value: 'RT', label: 'Edge Detection' },
      { value: 'AI', label: 'Document OCR' },
      { value: '3+', label: 'Export Formats' },
      { value: '☁️', label: 'Cloud Sync' },
    ],
    color: '#10B981',
    gradient: 'from-emerald-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/JetScan',
  },
  {
    id: 'nesters',
    index: '05',
    title: 'Nesters',
    descriptor: 'Roommate & Housing Platform',
    category: 'Cross-Platform · Real-Time',
    year: '2024',
    period: 'May 2024 — Jan 2025',
    tech: ['Flutter', 'Dart', 'Node.js', 'Socket.IO', 'Firebase', 'Supabase'],
    description: 'A cross-platform roommate matching application with smart compatibility scoring. Real-time chat via Socket.IO, listing management, and a preference-based matching algorithm that pairs people on lifestyle, schedule, and budget.',
    highlights: [
      'ML-powered compatibility matching algorithm for roommate pairing',
      'Real-time messaging system built on Socket.IO',
      'Cross-platform Flutter app for iOS and Android',
      'Firebase + Supabase dual-backend architecture',
      'Advanced search and filter engine for listings',
    ],
    stats: [
      { value: 'AI', label: 'Matching' },
      { value: 'RT', label: 'Chat System' },
      { value: '2', label: 'Platforms' },
      { value: '2', label: 'Backends' },
    ],
    color: '#EC4899',
    gradient: 'from-pink-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Nesters',
  },
  {
    id: 'skycast',
    index: '06',
    title: 'Skycast',
    descriptor: 'Modern Weather Application',
    category: 'Android · Material Design',
    year: '2025',
    period: 'Aug 2025',
    tech: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Retrofit', 'Room', 'Dagger Hilt', 'Coroutines'],
    description: 'A modern Android weather application built with Jetpack Compose and Kotlin, providing real-time weather data, 10-day forecasts, air quality monitoring, and weather-related news — all in a clean Material 3 interface with adaptive day/night theming.',
    highlights: [
      'Real-time weather data from multiple API providers for reliability',
      'Air quality monitoring with hourly AQI readings and pollutant breakdowns',
      '10-day forecast with daily and hourly breakdowns',
      'MVVM architecture with unidirectional data flow (State-Action-Event)',
      'Adaptive theming based on local day/night conditions with Material You support',
    ],
    stats: [
      { value: '5', label: 'Weather APIs' },
      { value: 'RT', label: 'Live Data' },
      { value: '10', label: 'Day Forecast' },
      { value: 'M3', label: 'Material 3' },
    ],
    color: '#38BDF8',
    gradient: 'from-sky-900/20 to-transparent',
    github: 'https://github.com/Dracula-101/Skycast',
  },
  // {
  //   id: 'crop-weed',
  //   index: '05',
  //   title: 'Crop & Weed Segmentation',
  //   descriptor: 'Deep Learning for Precision Agriculture',
  //   category: 'Research · Computer Vision',
  //   year: '2024',
  //   period: 'Feb 2024 — Jun 2024',
  //   tech: ['Python', 'TensorFlow', 'ResNet', 'U-Net', 'OpenCV', 'Kaggle'],
  //   description: 'A ResNet-UNet hybrid model for semantic segmentation of crops vs. weeds in high-resolution UAV imagery of sorghum fields. Leverages transfer learning, multi-scale augmentation, and advanced preprocessing to generalize across growth stages and environmental conditions.',
  //   highlights: [
  //     'Achieved 0.929 Sørensen-Dice Coefficient on UAV sorghum field imagery',
  //     'Built ResNet-UNet hybrid combining pretrained ResNet encoder with U-Net decoder',
  //     'Implemented data augmentation — rotations, flips, color jitter — for robustness',
  //     'Applied CLAHE and gamma correction preprocessing for varying lighting',
  //     'Evaluated across different environmental conditions and crop growth stages',
  //   ],
  //   stats: [
  //     { value: '0.929', label: 'Dice Score' },
  //     { value: 'UAV', label: 'Image Source' },
  //     { value: 'ResNet', label: 'Backbone' },
  //     { value: 'U-Net', label: 'Decoder' },
  //   ],
  //   color: '#22C55E',
  //   gradient: 'from-green-900/20 to-transparent',
  // },
];
