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
        id: 'aim4u',
        index: '01',
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
        index: '02',
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
