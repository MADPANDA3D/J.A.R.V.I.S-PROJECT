import React, { useState } from 'react';
import {
  Settings,
  Search,
  FileText,
  Code,
  Image,
  BarChart,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { useTools } from '../../hooks/useTools';
import { AVAILABLE_TOOLS } from '../../types/tools';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const iconMap = {
  search: Search,
  'file-text': FileText,
  code: Code,
  image: Image,
  'bar-chart': BarChart,
  zap: Zap,
  settings: Settings,
};

interface ToolsSelectorProps {
  className?: string;
  compact?: boolean;
}

export function ToolsSelector({
  className = '',
  compact = false,
}: ToolsSelectorProps) {
  const {
    availableTools,
    selectedTools,
    toggleTool,
    isToolSelected,
    getSelectedToolIds,
    loading,
  } = useTools();

  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = getSelectedToolIds().length;

  // Group tools by category
  const toolsByCategory = availableTools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, typeof availableTools>
  );

  const categories = Object.keys(toolsByCategory).sort();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Settings;
    return IconComponent;
  };

  if (loading) {
    return (
      <Button
        variant="outline"
        size={compact ? 'sm' : 'default'}
        disabled
        className={className}
      >
        <Settings className="h-4 w-4 animate-spin" />
        {!compact && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={`${className} relative`}
          aria-label={`Select tools (${selectedCount} selected)`}
        >
          <Settings className="h-4 w-4" />
          {!compact && (
            <>
              <span className="ml-2">Tools</span>
              {selectedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-[1.25rem] text-xs"
                >
                  {selectedCount}
                </Badge>
              )}
            </>
          )}
          {compact && selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 min-w-[1rem] text-xs px-1"
            >
              {selectedCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto"
        align="end"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Available Tools</span>
          <Badge variant="outline" className="text-xs">
            {selectedCount} selected
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {categories.map((category, categoryIndex) => (
          <div key={category}>
            {categoryIndex > 0 && <DropdownMenuSeparator />}

            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-2 py-1">
              {category}
            </DropdownMenuLabel>

            {toolsByCategory[category].map(tool => {
              const IconComponent = getIcon(tool.icon);
              const isSelected = isToolSelected(tool.id);

              return (
                <DropdownMenuCheckboxItem
                  key={tool.id}
                  checked={isSelected}
                  onCheckedChange={() => toggleTool(tool.id)}
                  className="flex items-start gap-3 px-3 py-2 cursor-pointer"
                >
                  <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {tool.description}
                    </div>
                  </div>
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
        ))}

        {selectedCount === 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              No tools selected. Choose tools to enhance your conversations.
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Selected tools will be available to the AI assistant for enhanced
          responses.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
