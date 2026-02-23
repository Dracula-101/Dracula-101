export interface Publication {
    id: string;
    title: string;
    shortTitle: string;
    conference: string;
    conferenceShort: string;
    venue: string;
    year: string;
    abstract: string;
    tech: string[];
    highlights: string[];
    color: string;
    status: 'published' | 'under-review' | 'preprint';
    doi?: string;
    arxiv?: string;
    github?: string;
    paper?: string;
}

export interface ResearchProject {
    id: string;
    title: string;
    descriptor: string;
    period: string;
    tech: string[];
    description: string;
    highlights: string[];
    color: string;
    github?: string;
    paper?: string;
    relatedPublication?: string; // id reference
}

/* ── Paper PDF imports ──────────────────────────────── */
import cropWeedPaper from '../assets/crop-weed/paper.pdf';
import handwritingOcrPaper from '../assets/handwriting-ocr/paper.pdf';
import fetalEcgPaper from '../assets/fetal-ecg/paper.pdf';
import skullStrippingPaper from '../assets/skull-stripping/paper.pdf';

export const publications: Publication[] = [
    {
        id: 'crop-weed',
        title: 'Crop and Weed Segmentation using ResNet-UNet Hybrid Architecture for Precision Agriculture',
        shortTitle: 'Crop-Weed Segmentation via ResNet-UNet',
        conference: 'Deep Learning for Precision Agriculture',
        conferenceShort: 'Research Project',
        venue: 'Feb 2024 — Jun 2024',
        year: '2024',
        abstract:
            'Developed a ResNet-UNet hybrid model for semantic segmentation of crops vs. weeds in high-resolution UAV imagery of sorghum fields. The pipeline leverages transfer learning, multi-scale augmentation, and advanced preprocessing to generalize across growth stages and field conditions.',
        tech: ['Python', 'TensorFlow', 'Kaggle', 'ResNet', 'U-Net', 'OpenCV'],
        highlights: [
            'Achieved 0.929 Sørensen-Dice Coefficient on UAV sorghum field imagery, outperforming baseline segmentation models',
            'Built ResNet-UNet hybrid combining pretrained ResNet encoder with U-Net decoder for multi-scale feature fusion',
            'Implemented extensive data augmentation — random rotations, flips, color jitter — improving model robustness across growth stages',
            'Applied CLAHE and gamma correction preprocessing to enhance feature extraction in varying lighting conditions',
            'Evaluated across different environmental conditions and crop growth stages demonstrating generalization capability',
        ],
        color: '#F5A623',
        status: 'published',
        paper: cropWeedPaper,
    },
    {
        id: 'handwriting-ocr',
        title: 'CRBC — An Automated Approach for Handwriting OCR',
        shortTitle: 'Handwriting OCR with CRBC',
        conference: '4th International Conference on Artificial Intelligence and Signal Processing',
        conferenceShort: 'AISP 2024',
        venue: 'VIT-AP University, Vellore',
        year: '2024',
        abstract:
            'Presented CRBC (CNN-RNN-BiLSTM-CTC), an end-to-end deep learning pipeline for offline handwriting recognition. The system combines convolutional feature extraction, recurrent sequence modeling with bidirectional LSTM layers, and CTC loss for alignment-free text prediction. Benchmarked against IAM Handwriting Dataset with competitive character and word error rates.',
        tech: ['Python', 'PyTorch', 'CNN', 'BiLSTM', 'CTC Loss', 'Computer Vision'],
        highlights: [
            'Built end-to-end CNN-RNN architecture combining spatial feature extraction with temporal sequence modeling',
            'Implemented CTC (Connectionist Temporal Classification) loss for alignment-free handwriting transcription',
            'Trained bidirectional LSTM decoder for improved context-aware character prediction',
            'Benchmarked on IAM Handwriting Dataset achieving competitive word and character error rates',
        ],
        color: '#6366F1',
        status: 'published',
        paper: handwritingOcrPaper,
    },
    {
        id: 'fetal-ecg',
        title: 'Enhancing Fetal ECG Extraction: Novel UNET Architecture using Continuous Wavelet Transforms',
        shortTitle: 'Fetal ECG Extraction via CWT-UNet',
        conference: 'International Conference on Integrated Circuits, Communication, and Computing Systems',
        conferenceShort: 'ICICCS 2024',
        venue: 'IIIT UNA, Himachal Pradesh',
        year: '2024',
        abstract:
            'Proposed a novel U-Net architecture leveraging Continuous Wavelet Transform (CWT) scalograms for non-invasive fetal ECG signal extraction from abdominal recordings. The approach converts 1D ECG signals into 2D time-frequency representations, enabling spatial feature learning through a modified encoder-decoder network with skip connections. Achieved superior signal separation compared to traditional adaptive filtering methods.',
        tech: ['Python', 'TensorFlow', 'CWT', 'U-Net', 'Signal Processing', 'Deep Learning'],
        highlights: [
            'Designed CWT-based preprocessing pipeline converting 1D ECG signals to 2D scalograms for spatial feature extraction',
            'Implemented modified U-Net architecture with skip connections optimized for biomedical signal separation',
            'Achieved improved fetal heart rate estimation accuracy compared to ICA and adaptive filtering baselines',
            'Evaluated on PhysioNet Challenge datasets with quantitative SNR improvement metrics',
        ],
        color: '#F5A623',
        status: 'published',
        paper: fetalEcgPaper,
    },
    {
        id: 'skull-stripping',
        title: 'Enhancing Shift-Invariance for Accurate Brain MRI Skull-Stripping using Adaptive Polyphase Pooling in Modified U-net',
        shortTitle: 'Brain MRI Skull-Stripping',
        conference: '2nd International Conference on Automation, Computing and Renewable Systems',
        conferenceShort: 'ICACRS 2023',
        venue: 'Mount Zion College of Engineering and Technology, Tamil Nadu',
        year: '2023',
        abstract:
            'Introduced adaptive polyphase pooling into a modified U-Net to address shift-invariance degradation in brain MRI skull-stripping tasks. Traditional max-pooling and strided convolutions lose spatial consistency under input shifts, reducing segmentation reliability. The proposed polyphase downsampling preserves anti-aliased feature maps, improving Dice scores on IBSR and LPBA40 brain MRI datasets.',
        tech: ['Python', 'TensorFlow', 'U-Net', 'Medical Imaging', 'Polyphase Pooling', 'MRI'],
        highlights: [
            'Replaced standard max-pooling with adaptive polyphase pooling to maintain shift-invariance in feature maps',
            'Modified U-Net encoder with anti-aliased downsampling for robust brain region segmentation',
            'Validated on IBSR and LPBA40 brain MRI datasets with improved Dice coefficient over baseline U-Net',
            'Demonstrated reduced sensitivity to input translations and rotations in automated skull-stripping pipeline',
        ],
        color: '#10B981',
        status: 'published',
        paper: skullStrippingPaper,
    },
];

export const researchProjects: ResearchProject[] = [];

/* Combined research stats for the section */
export const researchStats = {
    publications: publications.length,
    conferences: new Set(publications.map((p) => p.conferenceShort)).size,
    domains: ['Medical Imaging', 'Signal Processing', 'Computer Vision', 'Agriculture AI'],
};
