/**
 * Modern Document Container
 * Clean, focused document interface with contained scrolling
 * Designed for modern document workflows like Google Docs/Notion
 */

'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  ChevronLeft,
  Maximize2,
  Minimize2,
  Save,
  Edit3,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Wand2,
  Clock,
  User,
  BarChart3
} from 'lucide-react';

import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface ModernDocumentContainerProps {
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onEnhance?: () => void;
  enhanceLoading?: boolean;
  hasChanges?: boolean;
  isReadOnly?: boolean;
  isGeneratedContent?: boolean;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepTitle?: string;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    lastModified?: string;
    author?: string;
    version?: number;
    qualityScore?: number;
  };
  className?: string;
}

export function ModernDocumentContainer({
  title,
  children,
  onSave,
  onCancel,
  onEdit,
  onEnhance,
  enhanceLoading = false,
  hasChanges = false,
  isReadOnly = false,
  isGeneratedContent = false,
  showProgress = false,
  currentStep,
  totalSteps,
  stepTitle,
  metadata,
  className
}: ModernDocumentContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-hide cursor in fullscreen reading mode
  useEffect(() => {
    if (isFullscreen && isReadOnly) {
      let timeout: NodeJS.Timeout;
      const hideCursor = () => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'none';
        }
      };
      const showCursor = () => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
        clearTimeout(timeout);
        timeout = setTimeout(hideCursor, 3000);
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', showCursor);
        timeout = setTimeout(hideCursor, 3000);
      }

      return () => {
        if (container) {
          container.removeEventListener('mousemove', showCursor);
          container.style.cursor = 'default';
        }
        clearTimeout(timeout);
      };
    }
  }, [isFullscreen, isReadOnly]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClasses = cn(
    'transition-all duration-300 ease-in-out bg-white',
    isFullscreen
      ? 'fixed inset-0 z-50 bg-white'
      : 'relative w-full h-full',
    className
  );

  const contentClasses = cn(
    'flex flex-col h-full',
    isFullscreen
      ? 'max-w-6xl mx-auto p-8 h-screen'
      : 'w-full h-full'
  );

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className={contentClasses}>
        {/* Document Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          {/* Progress Bar (if showing progress) */}
          {showProgress && currentStep && totalSteps && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">{stepTitle}</span>
              </div>
              <Progress 
                value={(currentStep / totalSteps) * 100} 
                className="h-2" 
              />
            </div>
          )}

          {/* Main Header */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Title and Meta */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 truncate">
                      {title}
                    </h1>
                    <div className="flex items-center space-x-3 mt-1">
                      {isGeneratedContent && (
                        <Badge variant="secondary" className="text-xs">
                          <Wand2 className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                      {hasChanges && (
                        <Badge variant="warning" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unsaved Changes
                        </Badge>
                      )}
                      {!hasChanges && !isReadOnly && (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                      {metadata?.qualityScore && (
                        <Badge variant="info" className="text-xs">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Quality: {Math.round(metadata.qualityScore)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Metadata */}
                {metadata && (
                  <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
                    {metadata.wordCount && (
                      <span>{metadata.wordCount.toLocaleString()} words</span>
                    )}
                    {metadata.wordCount && metadata.characterCount && (
                      <span>•</span>
                    )}
                    {metadata.characterCount && (
                      <span>{metadata.characterCount.toLocaleString()} characters</span>
                    )}
                    {metadata.lastModified && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{metadata.lastModified}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Metadata Toggle (mobile) */}
                {metadata && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="lg:hidden"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                )}

                {/* AI Enhancement */}
                {onEnhance && !isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEnhance}
                    disabled={enhanceLoading}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100"
                  >
                    <Wand2 className={cn("h-4 w-4 mr-2", enhanceLoading && "animate-spin")} />
                    {enhanceLoading ? 'Enhancing...' : 'Enhance'}
                  </Button>
                )}

                {/* Edit Mode Toggle */}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="hidden sm:flex"
                  >
                    {isReadOnly ? (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                )}

                {/* Fullscreen Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Metadata */}
            {metadata && showMetadata && (
              <div className="lg:hidden mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
                {metadata.wordCount && (
                  <div>{metadata.wordCount.toLocaleString()} words</div>
                )}
                {metadata.characterCount && (
                  <div>{metadata.characterCount.toLocaleString()} characters</div>
                )}
                {metadata.lastModified && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Last modified: {metadata.lastModified}</span>
                  </div>
                )}
                {metadata.author && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Author: {metadata.author}</span>
                  </div>
                )}
                {metadata.version && (
                  <div>Version: {metadata.version}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Content - Contained Scrolling */}
        <div className="flex-1 min-h-0 bg-gray-50">
          <div className="h-full max-w-none mx-auto">
            <Card className="h-full border-0 rounded-none bg-white shadow-none">
              <CardContent className="h-full p-0">
                {/* Content Container with Scroll */}
                <div className={cn(
                  "h-full overflow-y-auto",
                  isFullscreen ? "px-16 py-12" : "px-8 py-8"
                )}>
                  {/* Document Paper Effect */}
                  <div className={cn(
                    "bg-white min-h-full rounded-lg shadow-sm border border-gray-200",
                    isFullscreen 
                      ? "max-w-4xl mx-auto px-16 py-12" 
                      : "px-8 py-8"
                  )}>
                    {children}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Footer - Actions */}
        {!isFullscreen && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left - Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {hasChanges ? (
                    <>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-amber-700 font-medium">Editing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {isReadOnly ? 'Ready for Review' : 'Saved'}
                      </span>
                    </>
                  )}
                </div>

                {/* Quick metadata for footer */}
                {metadata && (metadata.wordCount || metadata.characterCount) && (
                  <div className="text-sm text-gray-500 hidden sm:block">
                    {metadata.wordCount && `${metadata.wordCount} words`}
                    {metadata.wordCount && metadata.characterCount && ' • '}
                    {metadata.characterCount && `${metadata.characterCount} characters`}
                  </div>
                )}
              </div>

              {/* Right - Actions */}
              <div className="flex items-center space-x-3">
                {/* Cancel/Back */}
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {hasChanges ? 'Cancel' : 'Back'}
                  </Button>
                )}

                {/* Primary Action */}
                {onSave && !isReadOnly && (
                  <Button
                    onClick={onSave}
                    disabled={!hasChanges}
                    className={cn(
                      "shadow-sm font-medium min-w-[120px]",
                      hasChanges
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {hasChanges ? 'Save Changes' : 'Saved'}
                  </Button>
                )}

                {/* Continue for read-only */}
                {isReadOnly && onSave && (
                  <Button
                    onClick={onSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium min-w-[120px]"
                  >
                    Continue
                    <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Footer */}
        {isFullscreen && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </Button>
                {metadata && (metadata.wordCount || metadata.characterCount) && (
                  <div className="text-sm text-gray-500">
                    {metadata.wordCount && `${metadata.wordCount} words`}
                    {metadata.wordCount && metadata.characterCount && ' • '}
                    {metadata.characterCount && `${metadata.characterCount} characters`}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    {hasChanges ? 'Cancel' : 'Back'}
                  </Button>
                )}

                {onSave && (
                  <Button
                    onClick={onSave}
                    disabled={isReadOnly ? false : !hasChanges}
                    className={cn(
                      "shadow-sm font-medium min-w-[120px]",
                      isReadOnly
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : hasChanges
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {isReadOnly ? (
                      <>
                        Continue
                        <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {hasChanges ? 'Save Changes' : 'Saved'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModernDocumentContainer;
