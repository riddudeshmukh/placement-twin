// Shared Motion (Framer Motion) primitives for PlacementTwin.
// Centralizing variants keeps timing/easing consistent across the app
// instead of every component inventing its own duration/ease pair.

export const EASE = [0.22, 1, 0.36, 1]; // "premium" ease-out — quick start, soft landing

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

// Parent wrapper: staggers whichever children use `fadeUp`/`scaleIn` as variants.
export const staggerContainer = (stagger = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Viewport defaults for scroll-triggered reveals — fires once, a bit before
// the element is fully in view so content doesn't feel late.
export const viewportOnce = { once: true, margin: '-80px 0px -80px 0px' };

// Subtle lift used on interactive cards/buttons (hover + tap feedback).
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: EASE } },
  whileTap: { y: 0, scale: 0.98 },
};

export const tapScale = { whileTap: { scale: 0.97 } };

// Page/view transition used when switching between top-level app views
// (landing -> app, dashboard tab -> tab).
export const viewTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.32, ease: EASE },
};

// Respect prefers-reduced-motion: callers can spread this into `transition`
// when they need to zero out motion for accessibility-sensitive elements.
export const reducedMotionSafe = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
