/**
 * Bug Type Selector Component
 * Interactive selector for different bug types with descriptions and icons
 */

import React from 'react';
import type { BugTypeConfig } from '@/types/bugReport';

interface BugTypeSelectorProps {
  bugTypes: BugTypeConfig[];
  selectedType: BugTypeConfig | null;
  onSelect: (typeConfig: BugTypeConfig) => void;
  className?: string;
}

export const BugTypeSelector: React.FC<BugTypeSelectorProps> = ({
  bugTypes,
  selectedType,
  onSelect,
  className = ''
}) {
  return (
    <div className={`bug-type-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          What type of issue are you experiencing?
        </h3>
        <p className="text-sm text-gray-600">
          Select the category that best describes your bug report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bugTypes.map((bugType) => (
          <button
            key={bugType.type}
            type="button"
            onClick={() => onSelect(bugType)}
            className={`p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selectedType?.type === bugType.type
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            aria-pressed={selectedType?.type === bugType.type}
            role="radio"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {bugType.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">
                    {bugType.label}
                  </h4>
                  {selectedType?.type === bugType.type && (
                    <div className="text-blue-600">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {bugType.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    Default: {bugType.defaultSeverity}
                  </span>
                  {bugType.requiredFields.includes('reproductionSteps') && (
                    <span className="px-2 py-1 bg-orange-100 rounded-full text-orange-600">
                      Steps required
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded content when selected */}
            {selectedType?.type === bugType.type && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  Suggested information to include:
                </h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  {bugType.suggestedReproductionSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 text-lg">💡</div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Not sure which category to choose?
            </h4>
            <p className="text-sm text-blue-700">
              Don't worry! Pick the one that seems closest to your issue. Our team will 
              review and recategorize if needed. The most important thing is providing 
              a clear description of what's happening.
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility note */}
      <div className="sr-only" role="radiogroup" aria-label="Bug type selection">
        Use arrow keys to navigate between bug types and press Enter or Space to select.
      </div>
    </div>
  );
};