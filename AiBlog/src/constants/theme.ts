import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const isSmallDevice = width < 375;
export const isLargeDevice = width >= 428;

export const COLORS = {
  primary: "#E8622A", // Warm orange — brand
  primaryLight: "#FFF1EA", // Tint for tags
  black: "#1A1A1A",
  gray900: "#2D2D2D",
  gray700: "#4A4A4A",
  gray500: "#7A7A7A",
  gray300: "#C4C4C4",
  gray100: "#F5F5F5",
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.38)",
  overlayDeep: "rgba(0,0,0,0.6)",
};

export const FONTS = {
  // Display — heavy headings
  displayXL: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  displayLG: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  displayMD: { fontSize: isSmallDevice ? 18 : 20, fontWeight: "700" as const },

  // Body
  bodyLG: { fontSize: 16, fontWeight: "400" as const, lineHeight: 26 },
  bodyMD: { fontSize: 14, fontWeight: "400" as const, lineHeight: 22 },
  bodySM: { fontSize: 12, fontWeight: "400" as const, lineHeight: 18 },

  // UI labels
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8 },
  caption: { fontSize: 12, fontWeight: "500" as const },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
