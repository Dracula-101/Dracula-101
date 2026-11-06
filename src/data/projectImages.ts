/* ──────────────────────────────────────────────────────────
   Project screenshot manifests
   Each project maps to groups (e.g. "app", "stores")
   with labelled images that are eagerly imported so Vite
   can hash‑rename them at build time.
   ────────────────────────────────────────────────────────── */

export interface ProjectImage {
    src: string;
    label: string;
}

export interface ProjectImageGroup {
    title: string;
    images: ProjectImage[];
    /** 'mobile' (default) = horizontal strip, 'web' = browser mockup, 'static' = plain image */
    variant?: 'mobile' | 'web' | 'static';
    /** Optional description sections shown beside the image */
    description?: DiagramSection[];
}

export interface DiagramSection {
    heading: string;
    text: string;
}

export interface ProjectDiagram {
    title: string;
    chart: string;
    description: DiagramSection[];
}

/* ── Nesters ─────────────────────────────────────────── */
import nestersChat from '../assets/nesters/app/chat.png';
import nestersGoogleMaps from '../assets/nesters/app/google_maps.png';
import nestersMarketplace from '../assets/nesters/app/marketplace.png';
import nestersSublet from '../assets/nesters/app/sublet.png';
import nestersSubletDetail from '../assets/nesters/app/sublet_detail.png';
import nestersUserNetwork from '../assets/nesters/app/user_network.png';
import nestersAppStore from '../assets/nesters/stores/app_store.png';
import nestersGooglePlay from '../assets/nesters/stores/google_play.png';

import nestersArchitecture from '../assets/nesters/db/architecture.mermaid?raw';

/* ── JetScan ─────────────────────────────────────────── */
import jetscanHome from '../assets/jetscan/app/home.jpg';
import jetscanDocCrop from '../assets/jetscan/app/doc_crop.jpg';
import jetscanCroppedDoc from '../assets/jetscan/app/cropped_doc.jpg';
import jetscanDocFilter from '../assets/jetscan/app/doc_filter.jpg';
import jetscanDocPreview from '../assets/jetscan/app/doc_preview.jpg';
import jetscanDocScanning from '../assets/jetscan/app/doc_scanning.jpg';
import jetscanEditDoc from '../assets/jetscan/app/edit_doc.jpg';
import jetscanPreview from '../assets/jetscan/app/preview.jpg';
import jetscanMergeAdding from '../assets/jetscan/app/merge_adding.jpg';
import jetscanProtectAdding from '../assets/jetscan/app/protect_adding.jpg';
import jetscanScanQr from '../assets/jetscan/app/scan_qr.jpg';
import jetscanViewPdf from '../assets/jetscan/app/view_pdf.jpg';

/* ── Nesters ───────────────────────────────────────── */
import nestersIcon from '../assets/nesters/icon/icon.png';

/* ── Echo ─────────────────────────────────────────── */
import echoIcon from '../assets/echo/icon/icon.png';

/* ── Sync ─────────────────────────────────────────── */
import syncIcon from '../assets/sync/icon/icon.png';
import syncHomepage from '../assets/sync/web/homepage.png';
import syncDetail from '../assets/sync/web/detail.png';
import syncAddPost from '../assets/sync/web/add_post.png';
import syncProfile from '../assets/sync/web/profile.png';
import syncDbStructure from '../assets/sync/db/structure.png';

/* ── JetScan ──────────────────────────────────────── */
import jetscanIcon from '../assets/jetscan/icon/icon.png';

/* ── Pivot ────────────────────────────────────────── */
import pivotRestore from '../assets/pivot/fig/restore.png';
import pivotCredit from '../assets/pivot/fig/credit_accuracy.png';
import pivotTraining from '../assets/pivot/fig/training.png';
import pivotArchitecture from '../assets/pivot/architecture.mermaid?raw';

/* ── Skycast ─────────────────────────────────────── */
import skycastIntro from '../assets/skycast/app/intro.jpg';
import skycastHome from '../assets/skycast/app/home.jpg';
import skycastDailyWeather from '../assets/skycast/app/daily_weather.jpg';
import skycastForecast from '../assets/skycast/app/forecast.jpg';
import skycastWeekly from '../assets/skycast/app/weekly.jpg';
import skycastCurrentAqi from '../assets/skycast/app/current_aqi.jpg';
import skycastAqiIndex from '../assets/skycast/app/aqi_index.jpg';
import skycastDailyNews from '../assets/skycast/app/daily_news.jpg';
import skycastIcon from '../assets/skycast/icon/icon.png';

/**
 * Map of project id → image groups.
 * Projects without screenshots simply won't have an entry.
 */
export const projectImages: Record<string, ProjectImageGroup[]> = {
    pivot: [
        {
            title: 'Fork Runtime',
            variant: 'static',
            images: [{ src: pivotRestore, label: 'Time to restore a sandbox to step t' }],
            description: [
                { heading: 'Getting back to step t', text: 'Restoring an agent sandbox to its state after 3 actions takes 208 ms with a Firecracker snapshot and copy-on-write fork, vs 2,720 ms for a fresh Docker container plus replay: 13x faster. Running processes survive the restore; with Docker they do not.' },
                { heading: 'Forking N ways', text: 'Forking a running VM 16 ways takes 262 ms (1 clone: 50 ms). Running the test suite in all 16 clones at once takes 715 ms, down from 53 s before the huge-page, userfaultfd and idle-pause work (74x).' },
                { heading: 'Tech', text: 'Rust · Firecracker · userfaultfd · huge pages · XFS reflink · vsock' },
            ],
        },
        {
            title: 'Credit Accuracy',
            variant: 'static',
            images: [{ src: pivotCredit, label: 'Step-credit accuracy vs fork budget' }],
            description: [
                { heading: 'Setup', text: '24 tasks, 96 trajectories, 209 steps. Every state was forked 12x to build a brute-force oracle, with sample pools kept separate from the oracle.' },
                { heading: 'Result', text: 'At a 24-fork budget, fork-based step credit reached a Spearman of 0.60 against the oracle: about 2x GRPO (0.31) and 4x a frozen 3B LLM critic (0.15).' },
                { heading: 'Negative result', text: 'Letting the 3B critic choose which steps to fork roughly matched random choice (0.57 vs 0.60). A perfect selector reaches 0.64, so the headroom needs a stronger critic.' },
            ],
        },
        {
            title: 'RL Training',
            variant: 'static',
            images: [{ src: pivotTraining, label: 'Held-out success vs compute' }],
            description: [
                { heading: 'Budget-matched training', text: 'A 1.5B coding policy (Qwen2.5-Coder on MLX) trained with LoRA policy gradient, ~20 minutes of compute per method, evaluated on 7 unseen function families.' },
                { heading: 'Result', text: 'Held-out success rose from 17% to 62% with uniform fork credit, vs 27% for GRPO at equal compute, despite running fewer iterations (8 vs 22).' },
                { heading: 'Scope', text: 'Laptop-scale pilot with one seed (95% CI about ±0.10): read the learning results as directional.' },
            ],
        },
    ],
    nesters: [
        {
            title: 'App Screenshots',
            images: [
                { src: nestersMarketplace, label: 'Marketplace' },
                { src: nestersSublet, label: 'Sublet Listings' },
                { src: nestersSubletDetail, label: 'Listing Detail' },
                { src: nestersChat, label: 'Real-Time Chat' },
                { src: nestersGoogleMaps, label: 'Map View' },
                { src: nestersUserNetwork, label: 'User Network' },
            ],
        },
        {
            title: 'Store Listings',
            images: [
                { src: nestersAppStore, label: 'App Store' },
                { src: nestersGooglePlay, label: 'Google Play' },
            ],
        },
    ],
    jetscan: [
        {
            title: 'App Screenshots',
            variant: 'mobile',
            images: [
                { src: jetscanHome, label: 'Home' },
                { src: jetscanDocScanning, label: 'Scanning' },
                { src: jetscanDocCrop, label: 'Crop' },
                { src: jetscanCroppedDoc, label: 'Cropped' },
                { src: jetscanDocFilter, label: 'Filter' },
                { src: jetscanDocPreview, label: 'Preview' },
                { src: jetscanEditDoc, label: 'Edit' },
                { src: jetscanPreview, label: 'Full Preview' },
                { src: jetscanViewPdf, label: 'View PDF' },
                { src: jetscanMergeAdding, label: 'Merge Selection' },
                { src: jetscanProtectAdding, label: 'Protection' },
                { src: jetscanScanQr, label: 'Scan QR' },
            ],
        },
    ],
    skycast: [
        {
            title: 'App Screenshots',
            variant: 'mobile',
            images: [
                { src: skycastHome, label: 'Weather Home' },
                { src: skycastIntro, label: 'Intro' },
                { src: skycastDailyWeather, label: 'Daily Weather' },
                { src: skycastForecast, label: 'Forecast' },
                { src: skycastWeekly, label: 'Weekly Forecast' },
                { src: skycastCurrentAqi, label: 'Air Quality' },
                { src: skycastAqiIndex, label: 'AQI Index' },
                { src: skycastDailyNews, label: 'Weather News' },
            ],
        },
    ],
    sync: [
        {
            title: 'Web Screenshots',
            variant: 'web',
            images: [
                { src: syncHomepage, label: 'Homepage' },
                { src: syncDetail, label: 'Post Detail' },
                { src: syncAddPost, label: 'Add Post' },
                { src: syncProfile, label: 'User Profile' },
            ],
        },
        {
            title: 'Database Architecture',
            variant: 'static',
            images: [
                { src: syncDbStructure, label: 'DB Structure' },
            ],
            description: [
                {
                    heading: 'Overview',
                    text: 'Sync uses a hybrid storage approach — MongoDB for flexible content like posts and comments, and PostgreSQL for structured relational data like users, communities, and follower graphs.',
                },
                {
                    heading: 'Content Layer',
                    text: 'Posts, comments, and upvote records live in MongoDB collections, enabling schema-flexible content with nested replies and rich media attachments.',
                },
                {
                    heading: 'Social Graph',
                    text: 'The follower system and community memberships are stored in PostgreSQL with indexed foreign keys, powering the recommendation engine and real-time feed generation.',
                },
                {
                    heading: 'Tech',
                    text: 'MongoDB · PostgreSQL · Redis Pub/Sub · Go Backend · 80+ REST Endpoints',
                },
            ],
        },
    ],
};

/**
 * Map of project id → diagrams (mermaid charts).
 */
export const projectDiagrams: Record<string, ProjectDiagram[]> = {
    pivot: [
        {
            title: 'Architecture',
            chart: pivotArchitecture,
            description: [
                { heading: 'Host', text: 'Experiments run on a Mac: a batched MLX agent harness, the credit module (frozen critic, pivotal-step scheduler, isotonic calibration) and a LoRA trainer.' },
                { heading: 'Fork runtime', text: 'noded, a Rust daemon in a Lima VM, snapshots a running Firecracker microVM and serves its memory to N copy-on-write clones through a userfaultfd page server.' },
                { heading: 'Guest', text: 'A static Rust agent inside each VM executes commands over vsock and reseeds RNG and fixes the clock after every fork.' },
            ],
        },
    ],
    nesters: [
        {
            title: 'Database Architecture',
            chart: nestersArchitecture,
            description: [
                {
                    heading: 'Overview',
                    text: 'Built on Supabase (PostgreSQL) with Row Level Security enabled per-table. A single USER_DETAILS record, keyed by Supabase Auth UUID, owns every listing and interaction in the system.',
                },
                {
                    heading: 'Core Entities',
                    text: 'Three listing tables — APARTMENTS, SUBLETS, and MARKETPLACES — share an identical ownership pattern through user_id. Each stores pricing, a PostGIS geography column for radius-based search, and availability flags.',
                },
                {
                    heading: 'Matching System',
                    text: 'Each listing type has a dedicated likes junction table (APARTMENT_LIKES, SUBLET_LIKES, MARKETPLACES_LIKES) that records which user liked which listing — powering the swipe-to-match mechanic at the core of Nesters.',
                },
                {
                    heading: 'Tech',
                    text: 'PostgreSQL · PostGIS · Supabase Auth · Row Level Security · UUID foreign keys',
                },
            ],
        },
    ],
};

/**
 * Map of project id → app icon src.
 */
export const projectIcons: Record<string, string> = {
    nesters: nestersIcon,
    echo: echoIcon,
    sync: syncIcon,
    jetscan: jetscanIcon,
    skycast: skycastIcon,
};
