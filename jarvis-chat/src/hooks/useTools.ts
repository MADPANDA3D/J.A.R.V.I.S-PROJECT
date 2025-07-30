import { useState, useEffect, useCallback } from 'react';
import {
  AVAILABLE_TOOLS,
  type ToolSelection,
  type AvailableTool,
  type ToolPreferences,
} from '../types/tools';
import { useAuth } from '../contexts/AuthContext';

interface UseToolsReturn {
  availableTools: AvailableTool[];
  selectedTools: ToolSelection[];
  preferences: ToolPreferences;
  toggleTool: (toolId: string) => void;
  updatePreferences: (prefs: Partial<ToolPreferences>) => void;
  getSelectedToolIds: () => string[];
  isToolSelected: (toolId: string) => boolean;
  resetToDefaults: () => void;
  loading: boolean;
  error: string | null;
}

const DEFAULT_PREFERENCES: ToolPreferences = {
  auto_suggest: true,
  persist_selections: true,
  analytics_enabled: true,
};

export function useTools(): UseToolsReturn {
  const { user } = useAuth();
  const [selectedTools, setSelectedTools] = useState<ToolSelection[]>([]);
  const [preferences, setPreferences] =
    useState<ToolPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize default selections
  const initializeDefaultSelections = useCallback(() => {
    const defaultSelections: ToolSelection[] = AVAILABLE_TOOLS.filter(
      tool => tool.default_enabled
    ).map(tool => ({
      tool_id: tool.id,
      tool_name: tool.name,
      enabled: true,
      priority: 1,
    }));

    setSelectedTools(defaultSelections);
  }, []);

  // Load user preferences and tool selections from localStorage
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) {
        initializeDefaultSelections();
        setLoading(false);
        return;
      }

      try {
        // Load from localStorage first for immediate UI response
        const savedSelections = localStorage.getItem(
          `tools_selections_${user.id}`
        );
        const savedPreferences = localStorage.getItem(
          `tools_preferences_${user.id}`
        );

        if (savedSelections) {
          setSelectedTools(JSON.parse(savedSelections));
        } else {
          initializeDefaultSelections();
        }

        if (savedPreferences) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...JSON.parse(savedPreferences),
          });
        }

        // TODO: Load from Supabase for cross-device sync (future enhancement)
        // const { data: toolsData } = await supabase
        //   .from('user_tool_preferences')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single();
      } catch (err) => {
        console.error('Error loading tool preferences:', err);
        setError('Failed to load tool preferences');
        initializeDefaultSelections();
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user?.id, initializeDefaultSelections]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (!user?.id || loading) return;

    localStorage.setItem(
      `tools_selections_${user.id}`,
      JSON.stringify(selectedTools)
    );
    localStorage.setItem(
      `tools_preferences_${user.id}`,
      JSON.stringify(preferences)
    );
  }, [selectedTools, preferences, user?.id, loading]);

  // Record tool usage analytics
  const recordToolUsage = useCallback(
    async (toolId: string, toolName: string) => {
      if (!user?.id || !preferences.analytics_enabled) return;

      try {
        const sessionId =
          sessionStorage.getItem('chat_session_id') ||
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (!sessionStorage.getItem('chat_session_id')) {
          sessionStorage.setItem('chat_session_id', sessionId);
        }

        // TODO: Implement Supabase analytics when tools_usage table is created
        // await supabase.from('tools_usage').insert({
        //   user_id: user.id,
        //   tool_id: toolId,
        //   tool_name: toolName,
        //   session_id: sessionId,
        //   usage_count: 1
        // });

        console.log('Tool usage recorded:', { toolId, toolName, sessionId });
      } catch (err) => {
        console.error('Error recording tool usage:', err);
      }
    },
    [user?.id, preferences.analytics_enabled]
  );

  const toggleTool = useCallback(
    (toolId: string) => {
      const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
      if (!tool) return;

      setSelectedTools(prev => {
        const existingIndex = prev.findIndex(t => t.tool_id === toolId);

        if (existingIndex >= 0) {
          // Tool exists, toggle enabled state
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            enabled: !updated[existingIndex].enabled,
          };

          // Record usage when enabling
          if (updated[existingIndex].enabled) {
            recordToolUsage(toolId, tool.name);
          }

          return updated;
        } else {
          // Tool doesn't exist, add it as enabled
          const newSelection: ToolSelection = {
            tool_id: toolId,
            tool_name: tool.name,
            enabled: true,
            priority: 1,
          };

          recordToolUsage(toolId, tool.name);
          return [...prev, newSelection];
        }
      });
    },
    [recordToolUsage]
  );

  const updatePreferences = useCallback((prefs: Partial<ToolPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const getSelectedToolIds = useCallback(() => {
    return selectedTools.filter(tool => tool.enabled).map(tool => tool.tool_id);
  }, [selectedTools]);

  const isToolSelected = useCallback(
    (toolId: string) => {
      const tool = selectedTools.find(t => t.tool_id === toolId);
      return tool?.enabled || false;
    },
    [selectedTools]
  );

  const resetToDefaults = useCallback(() => {
    initializeDefaultSelections();
    setPreferences(DEFAULT_PREFERENCES);
  }, [initializeDefaultSelections]);

  return {
    availableTools: AVAILABLE_TOOLS,
    selectedTools,
    preferences,
    toggleTool,
    updatePreferences,
    getSelectedToolIds,
    isToolSelected,
    resetToDefaults,
    loading,
    error,
  };
}
