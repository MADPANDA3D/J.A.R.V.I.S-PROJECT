export interface AvailableTool {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'analysis' | 'productivity' | 'creative' | 'technical';
  icon: string;
  default_enabled: boolean;
  usage_count: number;
}

export interface ToolSelection {
  tool_id: string;
  tool_name: string;
  enabled: boolean;
  priority?: number;
}

export interface ToolPreferences {
  auto_suggest: boolean;
  persist_selections: boolean;
  analytics_enabled: boolean;
}

export interface ToolsUsage {
  id: string;
  user_id: string;
  tool_id: string;
  tool_name: string;
  session_id: string;
  usage_count: number;
  last_used: string;
  created_at: string;
}

export interface ToolsContext {
  user_selections: ToolSelection[];
  session_preferences: ToolPreferences;
}

export const AVAILABLE_TOOLS: AvailableTool[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the internet for current information',
    category: 'research',
    icon: 'search',
    default_enabled: false,
    usage_count: 0,
  },
  {
    id: 'file_analysis',
    name: 'File Analysis',
    description: 'Analyze uploaded documents and files',
    category: 'analysis',
    icon: 'file-text',
    default_enabled: true,
    usage_count: 0,
  },
  {
    id: 'code_review',
    name: 'Code Review',
    description: 'Review and analyze code for improvements',
    category: 'technical',
    icon: 'code',
    default_enabled: false,
    usage_count: 0,
  },
  {
    id: 'image_generation',
    name: 'Image Generation',
    description: 'Create and edit images with AI',
    category: 'creative',
    icon: 'image',
    default_enabled: false,
    usage_count: 0,
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis',
    description: 'Analyze and visualize data patterns',
    category: 'analysis',
    icon: 'bar-chart',
    default_enabled: false,
    usage_count: 0,
  },
  {
    id: 'task_automation',
    name: 'Task Automation',
    description: 'Automate repetitive tasks and workflows',
    category: 'productivity',
    icon: 'zap',
    default_enabled: false,
    usage_count: 0,
  },
];
