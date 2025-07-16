export const theme = {
  colors: {
    primary: '#FF7900',      // Vibrant orange primary
    secondary: '#FFBF00',    // Golden yellow secondary
    accent: '#2c82c4',       // Golden yellow accent
    accentSecondary: '#F2CF7E', // Light golden yellow
    background: '#000000',   // Black background
    surface: '#1A1A1A',      // Dark surface
    card: '#2D2D2D',         // Card background
    text: '#FFFFFF',         // White text
    textSecondary: '#B2B2B2', // Gray text
    textMuted: '#666666',    // Muted text
    border: '#333333',       // Border color
    success: '#00B894',      // Green
    warning: '#FFE642',      // Bright yellow warning
    error: '#FF7900',        // Orange error
    like: '#FFBF00',         // Golden yellow for like
    gradient: {
      primary: ['#FF7900', '#FFBF00'],
      accent: ['#FFBF00', '#F2CF7E'],
      warm: ['#FF7900', '#FFE642'],
      bright: ['#FFE642', '#F2CF7E'],
      dark: ['#2D2D2D', '#1A1A1A'],
    },
  },
  typography: {
    fonts: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  layout: {
    screen: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    card: {
      padding: 16,
      borderRadius: 12,
    },
  },
};

export type Theme = typeof theme; 