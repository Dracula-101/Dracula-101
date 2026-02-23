// Canonical spring configurations aligned to the design system.
// Every spring has explicit stiffness, damping, and mass — no defaults.
// Animation patterns reference Section 4 of the design spec.

export const springs = {
  // ── Tier 1: Interactive Controls ──
  // Press: scale(0.97), stiffness 400, damping 20
  press: { stiffness: 400, damping: 20, mass: 0.8 },

  // Magnetic button: snappy pull
  magnetic: { stiffness: 400, damping: 28, mass: 0.8 },

  // ── Tier 2: Content Cards ──
  // Card hover lift: translateY(-4px), stiffness 200, damping 18
  cardLift: { stiffness: 200, damping: 18, mass: 1.0 },

  // ── Cursor ──
  cursorDot: { stiffness: 900, damping: 30, mass: 0.3 },
  cursorRing: { stiffness: 180, damping: 22, mass: 1.2 },

  // ── Icon rotation ──
  iconSpin: { stiffness: 200, damping: 18, mass: 1.0 },

  // ── Card tilt ──
  tiltCard: { stiffness: 120, damping: 20, mass: 1.8 },

  // ── Drag ──
  drag: { stiffness: 300, damping: 22, mass: 1.0 },

  // ── Scale-in entrance (3D objects) ──
  scaleIn: { stiffness: 200, damping: 16, mass: 1.2 },
} as const;

// Standardized Framer Motion transition presets (Section 4)
export const transitions = {
  /** Entrance: y:24→0, opacity:0→1, ease-out, 500ms */
  entrance: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  /** Exit: y:0→-16, opacity:1→0, ease-in-out, 300ms */
  exit: {
    duration: 0.3,
    ease: [0.87, 0, 0.13, 1] as const,
  },
  /** Hover lift: translateY(-4px), ease-out, 150ms */
  hoverLift: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  /** Hover glow: border opacity change, 150ms */
  hoverGlow: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  /** Stagger: 60ms between items */
  stagger: 0.06,
} as const;
