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

export const experiences: Experience[] = [
    {
        id: 'visa',
        index: '01',
        role: 'Software Engineer Intern',
        company: 'Visa Inc.',
        location: 'Highlands Ranch, CO',
        period: 'May 2026 — Present',
        startDate: '2026-05',
        endDate: 'Present',
        type: 'internship',
        description:
            'Building VisionX — a production-grade automated log-triage platform that turns noisy application logs into ranked, actionable incidents. It ingests logs from APIs, CSV, and JSON, templates and embeds them, classifies and clusters errors into issues, scores each issue for risk against seasonal baselines, and can dispatch an autonomous agent to propose and ship a fix via GitHub and Jira through the Visa MCP Hub.',
        highlights: [
            'Built VisionX, an automated log-triage platform that ingests logs from APIs, CSV, and JSON, normalizes them with Drain3 template mining, and classifies errors with a frozen-embedding scikit-learn model — surfacing actionable issues instead of raw log counts',
            'Engineered a real-time monitoring pipeline on Kafka, PostgreSQL, and Redis with UMAP + HDBSCAN auto-clustering and LLM-generated cluster labels, exposing Prometheus metrics and Alertmanager-driven alerts on a live Grafana dashboard',
            'Designed a seasonal (day-of-week × hour) forecasting layer that scores incident risk against learned baselines, distinguishing live traffic spikes from historic batch backfills to prevent false alerts',
            'Shipped a two-stage LangGraph ReAct agent (fast triage → deep reasoning) that reads the offending repository, proposes a fix, and autonomously opens a GitHub PR plus Jira comment through the Visa MCP Hub',
            'Containerized the full stack with Docker and a modular FastAPI service architecture (storage repos, worker packages, and a FastMCP server), enforcing a 300-line, single-responsibility codebase standard',
        ],
        tech: ['Python', 'FastAPI', 'Kafka', 'PostgreSQL', 'Redis', 'scikit-learn', 'HDBSCAN', 'LangGraph', 'Prometheus', 'Grafana', 'Docker'],
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
        description:
            'Led development of two Flutter applications — Dermalens, an AI-powered healthcare platform, and Autobuddys, a socially impactful app for autistic children. Worked across mobile, cloud, and ML pipelines in a fast-paced startup environment.',
        highlights: [
            'Architected Dermalens, an AI-powered healthcare platform connecting patients with verified dermatologists using Flutter, AWS Lambda & Detectron2 for skin disease classification at 90–95% accuracy — 300+ downloads',
            'Led technical integration of Agora SDK for HIPAA-compliant real-time video consultations, enabling end-to-end telemedicine workflow from diagnosis to digital prescription management',
            'Pioneered rigorous testing protocols maintaining high code coverage while mentoring junior interns on collaborative development practices and software QA',
            'Co-developed Autobuddys, a Flutter application with interactive mini-games designed to help autistic children maintain focus — 250+ downloads with built-in performance analytics',
        ],
        tech: ['Flutter', 'Dart', 'AWS Lambda', 'Detectron2', 'Agora SDK', 'Firebase', 'Python'],
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
        description:
            'Engineered IoT health monitoring hardware and software for aging assessment through radial pulse analysis. Worked at the intersection of embedded systems, mobile development, and medical device engineering.',
        highlights: [
            'Engineered IoT health monitoring device for aging assessment through radial pulse analysis, achieving 566% improvement in data transfer rates by implementing BLE protocol with ESP32 microcontroller',
            'Developed comprehensive Flutter mobile patient management system featuring real-time pulse data visualization, secure data collection, and automated report generation for medical professionals',
            'Designed secure communication architecture implementing AES128 encryption and 4-pin authentication, ensuring data protection for sensitive medical information',
            'Innovated Over-The-Air (OTA) firmware update mechanism replacing manual USB updates, reducing production deployment time by 40%',
        ],
        tech: ['Flutter', 'Dart', 'ESP32', 'BLE', 'AES128', 'IoT', 'C++'],
        color: '#6366F1',
    },
];

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
        period: 'Aug 2025 — Present',
        gpa: '3.96',
        current: true,
    },
    {
        id: 'spit',
        degree: 'B.Tech Computer Engineering',
        school: 'Sardar Patel Institute of Technology',
        location: 'India',
        period: '2020 — 2024',
        gpa: '8.6 / 10.0',
        current: false,
    },
];

export const skills = {
    languages: ['Kotlin', 'Java', 'Dart', 'Go', 'Python', 'C', 'C++', 'JavaScript', 'TypeScript', 'SQL'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB', 'MySQL'],
    frameworks: ['Jetpack Compose', 'Flutter', 'Android', 'Flask', 'Django', 'Node.js', 'Express', 'React', 'TensorFlow Lite'],
    tools: ['Firebase', 'Google Cloud Platform', 'AWS', 'Docker', 'Kafka', 'CI/CD', 'Git', 'Figma'],
};
