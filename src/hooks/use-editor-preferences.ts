/**
 * Hook for managing editor preferences and layout state
 * Persists user preferences across sessions
 */

import { useState, useEffect, useCallback } from 'react';

export type ViewMode = 'editor' | 'split' | 'preview' | 'focus';
export type LayoutMode = 'side-by-side' | 'slideout' | 'overlay';

interface EditorPreferences {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  isSlideoutOpen: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  showWordCount: boolean;
  showCharacterCount: boolean;
  enableSpellCheck: boolean;
}

const DEFAULT_PREFERENCES: EditorPreferences = {
  viewMode: 'editor',
  layoutMode: 'side-by-side',
  isSlideoutOpen: false,
  autoSave: true,
  autoSaveInterval: 5000, // 5 seconds
  theme: 'light',
  fontSize: 'medium',
  showWordCount: true,
  showCharacterCount: true,
  enableSpellCheck: true,
};

const STORAGE_KEY = 'carsa-editor-preferences';

export function useEditorPreferences() {
  const [preferences, setPreferences] = useState<EditorPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load editor preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save editor preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  // Update specific preference
  const updatePreference = useCallback(<K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates: Partial<EditorPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  // Smart view mode switching with layout consideration
  const setViewMode = useCallback((mode: ViewMode) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, viewMode: mode };
      
      // Auto-open slideout when switching to split mode with slideout layout
      if (mode === 'split' && prev.layoutMode === 'slideout') {
        newPrefs.isSlideoutOpen = true;
      }
      
      // Close slideout when switching away from split mode
      if (mode !== 'split') {
        newPrefs.isSlideoutOpen = false;
      }
      
      return newPrefs;
    });
  }, []);

  // Smart layout mode switching
  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, layoutMode: mode };
      
      // Auto-open slideout when switching to slideout layout in split mode
      if (mode === 'slideout' && prev.viewMode === 'split') {
        newPrefs.isSlideoutOpen = true;
      }
      
      // Close slideout when switching away from slideout layout
      if (mode !== 'slideout') {
        newPrefs.isSlideoutOpen = false;
      }
      
      return newPrefs;
    });
  }, []);

  // Toggle slideout panel
  const toggleSlideout = useCallback(() => {
    updatePreference('isSlideoutOpen', !preferences.isSlideoutOpen);
  }, [preferences.isSlideoutOpen, updatePreference]);

  // Get CSS classes based on preferences
  const getEditorClasses = useCallback(() => {
    const classes = [];
    
    // Font size classes
    switch (preferences.fontSize) {
      case 'small':
        classes.push('text-sm');
        break;
      case 'large':
        classes.push('text-lg');
        break;
      default:
        classes.push('text-base');
    }
    
    // Theme classes
    if (preferences.theme === 'dark') {
      classes.push('dark');
    }
    
    return classes.join(' ');
  }, [preferences.fontSize, preferences.theme]);

  // Check if a specific view mode is active
  const isViewModeActive = useCallback((mode: ViewMode) => {
    return preferences.viewMode === mode;
  }, [preferences.viewMode]);

  // Check if a specific layout mode is active
  const isLayoutModeActive = useCallback((mode: LayoutMode) => {
    return preferences.layoutMode === mode;
  }, [preferences.layoutMode]);

  // Get display configuration based on current preferences
  const getDisplayConfig = useCallback(() => {
    return {
      showEditor: preferences.viewMode !== 'preview',
      showPreview: preferences.viewMode === 'preview' || preferences.viewMode === 'split',
      showSideBySide: preferences.viewMode === 'split' && preferences.layoutMode === 'side-by-side',
      showSlideout: preferences.viewMode === 'split' && preferences.layoutMode === 'slideout',
      showOverlay: preferences.viewMode === 'split' && preferences.layoutMode === 'overlay',
      isFocusMode: preferences.viewMode === 'focus',
    };
  }, [preferences.viewMode, preferences.layoutMode]);

  return {
    preferences,
    isLoaded,
    updatePreference,
    updatePreferences,
    resetPreferences,
    setViewMode,
    setLayoutMode,
    toggleSlideout,
    getEditorClasses,
    isViewModeActive,
    isLayoutModeActive,
    getDisplayConfig,
  };
}

export default useEditorPreferences;