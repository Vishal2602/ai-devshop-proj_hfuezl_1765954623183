/**
 * Framer Motion animation presets for PDF Tarot Reader
 * Consistent, magical animations throughout the app
 */

// Card entrance animation - fade + y slide
export const cardEntrance = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Card flip animation config
export const cardFlip = {
  initial: { rotateY: 180 },
  animate: { rotateY: 0 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    duration: 0.6
  }
};

// Hover micro-interaction
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.12 }
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] }
};

// Success celebration - pop effect
export const popIn = {
  initial: { scale: 0, opacity: 0, rotate: -12 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: -3,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Badge bounce
export const badgeBounce = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

// Shimmer loading effect
export const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Progress bar animation
export const progressBar = {
  initial: { width: "0%" },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: { duration: 0.3, ease: "linear" }
  })
};

// Fade in from below
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

// Dropzone active state
export const dropzoneActive = {
  scale: 1.02,
  borderColor: "var(--color-primary)",
  transition: { duration: 0.15 }
};

// Card spread positions
export const cardSpreadPositions = {
  past: { rotate: -5, x: 0 },
  present: { rotate: 0, x: 0 },
  future: { rotate: 5, x: 0 }
};

// Confetti particle
export const confettiParticle = (index) => ({
  initial: {
    opacity: 1,
    scale: 0,
    x: 0,
    y: 0
  },
  animate: {
    opacity: 0,
    scale: [0, 1, 1],
    x: Math.cos(index * 30 * Math.PI / 180) * (80 + Math.random() * 40),
    y: [0, -(60 + Math.random() * 40), 100],
    rotate: Math.random() * 720 - 360,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
});
