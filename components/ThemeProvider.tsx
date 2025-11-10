import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of a theme
export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  primary: string;
  primaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
}

// Define the predefined themes
const themes: { [key: string]: ThemeColors } = {
  soulfulCalm: {
    background: '230 50% 96%', // Light Lavender
    surface: '0 0% 100%',     // White
    border: '208 44% 80%',     // Soft Blue
    primary: '212 36% 45%',     // Steel Blue
    primaryAccent: '212 26% 84%', // Light Steel Blue
    textPrimary: '0 0% 30%',       // Dark Gray
    textSecondary: '0 0% 40%',   // Medium Gray
    textOnPrimary: '0 0% 100%',    // White
  },
  focusFlow: {
    background: '39 100% 97%', // Cream
    surface: '0 0% 100%',      // White
    border: '39 89% 80%',      // Soft Orange
    primary: '14 83% 53%',     // Burnt Orange
    primaryAccent: '14 83% 90%', // Light Orange
    textPrimary: '14 50% 25%',      // Dark Brown
    textSecondary: '14 30% 45%',   // Muted Brown
    textOnPrimary: '0 0% 100%',     // White
  },
  soulfulNight: {
    background: '212 35% 15%', // Very Dark Blue
    surface: '212 35% 20%',    // Dark Blue
    border: '212 30% 35%',     // Muted Blue Border
    primary: '212 80% 70%',    // Bright Blue
    primaryAccent: '212 50% 40%', // Mid Blue
    textPrimary: '210 30% 95%',      // Off-white
    textSecondary: '210 20% 70%',   // Light Gray
    textOnPrimary: '212 35% 15%',    // Very Dark Blue
  },
};

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  currentColors: ThemeColors;
  setCustomColor: (colorName: keyof ThemeColors, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper to convert hex to HSL string without the 'hsl()' wrapper
const hexToHslString = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('soulfulHubTheme') || 'soulfulCalm');
  const [customColors, setCustomColors] = useState<ThemeColors>(() => {
    const savedCustom = localStorage.getItem('soulfulHubCustomColors');
    try {
        if (savedCustom) {
            const parsed = JSON.parse(savedCustom);
            // Basic validation to ensure it's a theme object
            if (parsed && typeof parsed.background === 'string') {
                return parsed;
            }
        }
    } catch (e) {
        // FIX: The caught error `e` is of type `unknown`. Pass it directly to console.error for better debugging and to resolve the type error.
        console.error("Failed to parse custom colors from localStorage", e);
    }
    return themes.soulfulCalm;
  });

  const currentColors = theme === 'custom' ? customColors : themes[theme] || themes.soulfulCalm;

  useEffect(() => {
    const root = document.documentElement;
    if (!root) return;
    
    const colorsToApply = theme === 'custom' ? customColors : themes[theme];
    if (!colorsToApply) return;
    
    Object.entries(colorsToApply).forEach(([key, value]) => {
        const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
    });

    localStorage.setItem('soulfulHubTheme', theme);
  }, [theme, customColors]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };
  
  const setCustomColor = (colorName: keyof ThemeColors, value: string) => {
    const newCustomColors = {
      ...customColors,
      [colorName]: hexToHslString(value),
    };
    setCustomColors(newCustomColors);
    localStorage.setItem('soulfulHubCustomColors', JSON.stringify(newCustomColors));
  };


  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentColors, setCustomColor }}>
        <div className={`theme-${theme}`}>
            {children}
        </div>
    </ThemeContext.Provider>
  );
};
