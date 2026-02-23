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
    id: 'echo',
    index: '01',
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
    index: '02',
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
    index: '03',
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
    index: '04',
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
