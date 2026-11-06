import { VARIANT, pick } from './variant';

export interface Experience {
    id: string;
    index: string;
    role: string;
    company: string;
    location: string;
    period: string;
    startDate: string;
    endDate: string;
    type: 'internship' | 'full-time' | 'research';
    description: string;
    highlights: string[];
    tech: string[];
    color: string;
}

const base: Experience[] = [
    {
        id: 'visa',
        index: '01',
        role: 'Software Engineer Intern',
        company: 'Visa Inc.',
        location: 'Highlands Ranch, CO',
        period: 'May 2026 — Aug 2026',
        startDate: '2026-05',
        endDate: '2026-08',
        type: 'internship',
        description:
            'Built VisionX, an AI log-triage platform for the ATM monitoring team. It templates and classifies ~1M logs/hour, clusters failures into ranked P0–P3 issues, scores each source for outage risk, and dispatches an autonomous agent that ships fixes as GitHub pull requests with Jira comments through an internal MCP hub.',
        highlights: [],
        tech: [],
        color: '#3B82F6',
    },
    {
        id: 'aim4u',
        index: '02',
        role: 'Software Developer Intern',
        company: 'Aim4U Software Solutions Pvt. Ltd.',
        location: 'Mumbai, India',
        period: 'Nov 2023 — Dec 2024',
        startDate: '2023-11',
        endDate: '2024-12',
        type: 'internship',
        description: '',
        highlights: [],
        tech: [],
        color: '#F5A623',
    },
    {
        id: 'acuradyne',
        index: '03',
        role: 'Research & Software Intern',
        company: 'Acuradyne Systems Pvt. Ltd., IIT Bombay Research Park',
        location: 'Mumbai, India',
        period: 'Jan 2023 — Jun 2023',
        startDate: '2023-01',
        endDate: '2023-06',
        type: 'research',
        description: '',
        highlights: [],
        tech: [],
        color: '#6366F1',
    },
];

type ExperienceCopy = Pick<Experience, 'highlights' | 'tech'> & Partial<Pick<Experience, 'description'>>;

/* Bullets mirror the tailored resumes (source of truth: career KB). */
const byVariant: Record<'swe' | 'android', Record<string, ExperienceCopy>> = {
    swe: {
        visa: {
            highlights: [
                'Architected VisionX, an AI log-triage platform for ATM monitoring: Drain3 templating, a 20-class embedding classifier (82% F1) with LLM escalation, and HDBSCAN clustering that condenses ~30K templates into ~200 ranked issues',
                'Built a LangGraph remediation agent that picks up P0 issues, clones the failing repository, diagnoses the root cause, and ships each fix as a GitHub pull request with a Jira comment; its fixes for real issues were merged',
                'Engineered a fault-tolerant FastAPI + Kafka pipeline (9 topics, retry backoff, dead-letter queue) over PostgreSQL, sustaining ~1M logs/hour by classifying each log template once and caching embeddings in Redis and SQLite',
                'Cut triage time 50–60% versus manual Splunk and Grafana searches; demoed VisionX live to VP-level leadership',
                'Stopped false on-call pages by keeping backfilled logs (600s+ lag) out of live Prometheus and Alertmanager rules',
                'Built a 0–100 outage risk engine on seasonal baselines, flagging at-risk ATM sources early with a recommended action',
            ],
            tech: ['Python', 'FastAPI', 'Kafka', 'PostgreSQL', 'Redis', 'LangGraph', 'scikit-learn', 'HDBSCAN', 'Prometheus', 'Grafana', 'Docker', 'React'],
        },
        aim4u: {
            description:
                'Owned the cloud backend of Dermalens, an AI telehealth platform: a Django REST API and website with Stripe payments, serverless model inference on AWS Lambda, and the AWS infrastructure behind it.',
            highlights: [
                'Architected the cloud backend of Dermalens, an AI telehealth platform: a Django REST API and website for booking, e-prescriptions, and Stripe payments with webhook-confirmed bookings, refunds, and Connect doctor payouts',
                'Replaced the legacy TensorFlow predictor with a Detectron2 + PyTorch skin-disease model (90–95% accuracy), served as serverless inference on AWS Lambda behind API Gateway so it scales independently of the backend',
                'Deployed the backend on self-managed Kubernetes on EC2; owned Route 53, S3, ECR, IAM, and CloudWatch',
                "Pitched Dermalens to investors at 3+ startup competitions; shipping the judges' feedback lifted downloads by 23%",
                'Built GitHub Actions CI/CD with lint, pre-merge checks, and integration tests; mentored 4–5 junior interns',
            ],
            tech: ['Python', 'Django', 'Stripe', 'AWS Lambda', 'API Gateway', 'Kubernetes', 'EC2', 'PyTorch', 'Detectron2', 'GitHub Actions'],
        },
        acuradyne: {
            description:
                'Built the software around an IoT radial-pulse device for aging assessment: the BLE data link, cloud patient records, and a Node.js report backend on GCP.',
            highlights: [
                'Co-designed a chunked BLE protocol on ESP32 for an IoT pulse monitor: 566% faster transfer (850ms to 127ms)',
                'Migrated patient records from offline, device-locked SQLite to Firestore, syncing the same data across all devices',
                'Built a Node.js backend on GCP with JWT auth, generating 1K+ clinical pulse reports per day via Puppeteer',
                'Replaced manual USB flashing with OTA firmware updates (checksums, rollback), cutting production time ~40%',
                'Automated tester builds for end-to-end internal testing and set up a Docker dev environment; led 3–4 interns',
            ],
            tech: ['Node.js', 'Express', 'GCP', 'JWT', 'Firestore', 'BLE', 'ESP32', 'Docker'],
        },
    },
    android: {
        visa: {
            highlights: [
                'Architected VisionX, an AI log-triage platform for ATM monitoring: Drain3 templating, a 20-class embedding classifier (82% F1) with LLM escalation, and HDBSCAN clustering of ~30K templates into ~200 ranked issues',
                'Built a LangGraph remediation agent that diagnoses the root cause and ships its fixes as merged GitHub PRs',
                'Engineered a FastAPI + Kafka pipeline handling ~1M logs/hour with a dead-letter queue over PostgreSQL',
                "Cut issue triage time 50–60% versus manual engineer review; demoed VisionX live to Visa's VP-level leadership",
                'Wrote an 84-page design document before building VisionX, then handed it off to a new-grad engineer on the team',
                'Built a 0–100 outage risk engine that flags at-risk sources with leading indicators and a recommended action',
            ],
            tech: ['Python', 'FastAPI', 'Kafka', 'PostgreSQL', 'Redis', 'LangGraph', 'Docker', 'React'],
        },
        aim4u: {
            description:
                'Built and shipped two Flutter apps to Google Play and the App Store: Dermalens, an AI telehealth platform, and Autobuddys, a learning app for autistic children.',
            highlights: [
                'Architected Dermalens, an AI telehealth platform (discovery, booking, payments, e-prescriptions) on Flutter and AWS Lambda, integrating a Detectron2 + ResNet skin-disease model (90–95% accuracy); 300+ downloads',
                'Co-developed Autobuddys, a Flutter app with 5 gamified modules and Firebase analytics; 250+ downloads',
                'Built GitHub Actions CI/CD running lint, widget tests, signed builds, and Firebase App Distribution betas',
                'Owned Google Play and App Store releases, signing, and medical-app compliance; migrated both apps from Flutter 2 to 3',
                "Pitched Dermalens at 3+ startup competitions; shipping the judges' feedback lifted downloads 23%; mentored 4–5 junior interns",
            ],
            tech: ['Flutter', 'Dart', 'Firebase', 'AWS Lambda', 'Detectron2', 'GitHub Actions', 'Play Console'],
        },
        acuradyne: {
            description:
                'Built the mobile app and BLE data link for an IoT radial-pulse device used for aging assessment.',
            highlights: [
                'Re-engineered the data link of an IoT radial-pulse device, migrating Bluetooth Classic to BLE on ESP32 with chunked reassembly for 566% faster transfer (60 to 400 points/s; 850ms to 127ms per data payload)',
                'Built a Flutter patient app with 60fps real-time pulse charts and PDF clinical reports (1K+ per day)',
                'Added BLE auto-connect and disconnect with power optimization, extending device battery life between sessions',
                'Shipped OTA firmware over BLE with checksum-verified transfer and rollback, cutting production time ~40%',
            ],
            tech: ['Flutter', 'Dart', 'BLE', 'ESP32', 'Firestore', 'OTA'],
        },
    },
};

export const experiences: Experience[] = base.map((e) => ({ ...e, ...byVariant[VARIANT][e.id] }));

export interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    period: string;
    gpa: string;
    current: boolean;
}

export const education: Education[] = [
    {
        id: 'cu-boulder',
        degree: 'M.S. Computer Science',
        school: 'University of Colorado Boulder',
        location: 'United States',
        period: 'Aug 2025 — May 2027',
        gpa: '3.8 / 4.0',
        current: true,
    },
    {
        id: 'spit',
        degree: 'B.Tech Computer Engineering',
        school: 'Sardar Patel Institute of Technology',
        location: 'India',
        period: 'Oct 2020 — May 2024',
        gpa: '3.96 / 4.0',
        current: false,
    },
];

export interface SkillGroup {
    title: string;
    items: string[];
}

/* Mirrors the Technical Skills section of each resume. */
export const skillGroups: SkillGroup[] = pick({
    swe: [
        { title: 'LANGUAGES & AI', items: ['Python', 'Go', 'Java', 'TypeScript', 'Kotlin', 'C++', 'SQL', 'Rust', 'PyTorch', 'LangGraph'] },
        { title: 'BACKEND & SYSTEMS', items: ['Distributed Systems', 'Microservices', 'Kafka', 'gRPC', 'WebSockets', 'FastAPI', 'Django', 'React'] },
        { title: 'CLOUD & DATA', items: ['AWS', 'GCP', 'Kubernetes', 'Docker', 'PostgreSQL', 'Redis', 'Prometheus', 'Grafana', 'Linux'] },
    ],
    android: [
        { title: 'LANGUAGES', items: ['Kotlin (Coroutines/Flow)', 'Java', 'Dart', 'Python', 'Go', 'SQL'] },
        { title: 'ANDROID & UI', items: ['Jetpack Compose', 'Material 3', 'Navigation Compose', 'CameraX', 'Room', 'Retrofit/OkHttp', 'Flutter'] },
        { title: 'ARCHITECTURE', items: ['MVVM/MVI', 'Clean Architecture', 'Multi-module Gradle', 'Hilt/Dagger', 'Offline-first Sync'] },
        { title: 'TESTING & RELEASE', items: ['JUnit', 'MockK', 'Espresso', 'Lint', 'Android Profiler', 'R8', 'GitHub Actions', 'Play Console', 'Git'] },
    ],
});
