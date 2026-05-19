// Animation and timing constants
export const ANIMATION_DURATION = {
  STEP_TRANSITION: 0.4,
  STEP_INDICATOR: 0.3,
  CHECK_ICON: 0.3,
} as const;

// WebGL and rendering constants
export const WEBGL_CONSTANTS = {
  MAX_DEVICE_PIXEL_RATIO: 2,
  MOUSE_SMOOTHING: 0.92,
  OUTSIDE_MARGIN: 0.2,
  INTERSECTION_THRESHOLD: 0.1,
} as const;

// LightRays shader constants
export const LIGHT_RAYS_CONSTANTS = {
  RAY_LENGTH_DEFAULT: 2,
  LIGHT_SPREAD_DEFAULT: 1,
  RAY_SPEED_DEFAULT: 1,
  FADE_DISTANCE_DEFAULT: 1.0,
  SATURATION_DEFAULT: 1.0,
  MOUSE_INFLUENCE_DEFAULT: 0.1,
  NOISE_AMOUNT_DEFAULT: 0.0,
  DISTORTION_DEFAULT: 0.0,
  PULSATING_DEFAULT: false,
  FOLLOW_MOUSE_DEFAULT: true,
} as const;

// Stepper constants
export const STEPPER_CONSTANTS = {
  INITIAL_STEP: 1,
  STEP_INDICATOR_SIZE: 8,
  CONNECTOR_HEIGHT: 0.5,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: "onboardingCompleted",
} as const;

// Colors
export const COLORS = {
  DEFAULT_RAY_COLOR: "#ffffff",
} as const;
