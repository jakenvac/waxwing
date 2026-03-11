/**
 * Dark purple color theme for Waxwing
 * Optimized for small screens with high contrast
 */
export const colors = {
  // Primary purple shades
  primary: '#7C3AED', // Deep purple - primary actions
  primaryDark: '#5B21B6', // Darker purple - pressed states
  primaryLight: '#A78BFA', // Light purple - highlights
  
  // Background colors
  background: '#1A0B2E', // Very dark purple - main background
  surface: '#2D1B4E', // Dark purple - card/surface background
  surfaceLight: '#3D2B5E', // Medium purple - elevated surfaces
  
  // Text colors
  textPrimary: '#FFFFFF', // White - primary text
  textSecondary: '#C4B5FD', // Light purple - secondary text
  textDisabled: '#6B5B95', // Muted purple - disabled text
  
  // Status colors
  success: '#10B981', // Green - success states
  error: '#EF4444', // Red - error states
  warning: '#F59E0B', // Amber - warning states
  info: '#3B82F6', // Blue - info states
  accent: '#14B8A6', // Teal - accent/add actions
  
  // UI elements
  border: '#4C3A6D', // Purple-gray - borders
  divider: '#3D2B5E', // Dark purple - dividers
  overlay: 'rgba(26, 11, 46, 0.8)', // Semi-transparent dark purple
  
  // Interactive states
  hover: '#6D28D9', // Purple - hover state
  pressed: '#5B21B6', // Darker purple - pressed state
  focus: '#8B5CF6', // Bright purple - focus ring
};

export type ColorName = keyof typeof colors;
