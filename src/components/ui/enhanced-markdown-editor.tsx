/**
 * Enhanced Markdown Editor Component
 * Modern WYSIWYG editor with rich formatting and table support
 */

'use client';

// Import MD Editor styles
import '@uiw/react-md-editor/markdown-editor.css';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Eye, 
  Edit, 
  Save, 
  X, 
  Maximize2, 
  Minimize2,
  FileText,
  Wand2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

// Dynamically import MD Editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface EnhancedMarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
  height?: number;
  showPreviewMode?: boolean;
  showFullscreenMode?: boolean;
  isGeneratedContent?: boolean;
  onEnhance?: () => void;
  enhanceLoading?: boolean;
}

type ViewMode = 'edit' | 'preview' | 'split' | 'live';

export function EnhancedMarkdownEditor({ 
  content, 
  onSave, 
  onCancel,
  title = "Content Editor",
  className,
  readOnly = false,
  placeholder = "Start writing your content...",
  height = 400,
  showPreviewMode = true,
  showFullscreenMode = true,
  isGeneratedContent = false,
  onEnhance,
  enhanceLoading = false
}: EnhancedMarkdownEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [viewMode, setViewMode] = useState<ViewMode>(readOnly ? 'preview' : 'live');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditorContent(content);
    setHasChanges(false);
  }, [content]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setEditorContent(newContent);
    setHasChanges(newContent !== content);
  };

  // Smart mode detection based on content complexity
  const getContentComplexity = () => {
    const hasMarkdown = /[*_`#\[\]|]/.test(editorContent);
    const hasTables = /\|.*\|/.test(editorContent);
    const hasLists = /^[\s]*[-+*]\s+|\d+\.\s+/m.test(editorContent);
    const hasHeaders = /^#{1,6}\s+/m.test(editorContent);
    
    if (hasTables) return 'complex';
    if (hasMarkdown || hasLists || hasHeaders) return 'moderate';
    return 'simple';
  };

  const suggestBestMode = () => {
    const complexity = getContentComplexity();
    if (complexity === 'complex') return 'split';
    if (complexity === 'moderate') return 'live';
    return 'live';
  };

  const handleSave = () => {
    onSave(editorContent);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    setEditorContent(content);
    setHasChanges(false);
    onCancel?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  const editorHeight = isFullscreen ? 'calc(100vh - 200px)' : height;

  return (
    <div 
      ref={containerRef}
      className={cn(
        'w-full transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 bg-white p-6',
        className
      )}
    >
      <Card className={cn('w-full shadow-lg', isFullscreen && 'h-full')}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
              {isGeneratedContent && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  AI Generated
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* AI Enhancement Button */}
              {onEnhance && !readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnhance}
                  disabled={enhanceLoading}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Wand2 className={cn(
                    "h-4 w-4 mr-1",
                    enhanceLoading && "animate-spin"
                  )} />
                  {enhanceLoading ? 'Enhancing...' : 'Enhance with AI'}
                </Button>
              )}

              {/* View Mode Toggle */}
              {showPreviewMode && !readOnly && (
                <div className="flex items-center border border-gray-200 rounded-md">
                  <Button
                    variant={viewMode === 'live' ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('live')}
                    className="rounded-r-none border-r"
                    title="Live editing with instant preview"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Live
                  </Button>
                  <Button
                    variant={viewMode === 'split' ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('split')}
                    className="rounded-none border-r"
                    title="Side-by-side editing and preview"
                  >
                    Split
                  </Button>
                  <Button
                    variant={viewMode === 'edit' ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('edit')}
                    className="rounded-none border-r"
                    title="Raw markdown editing"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Code
                  </Button>
                  <Button
                    variant={viewMode === 'preview' ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('preview')}
                    className="rounded-l-none"
                    title="Preview only (read-only)"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              )}

              {/* Fullscreen Toggle */}
              {showFullscreenMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mode Information */}
          {!readOnly && (
            <div className="flex items-center justify-between text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">
                  {viewMode === 'live' && 'Live editing mode - See changes as you type'}
                  {viewMode === 'split' && 'Split mode - Edit and preview side by side'}
                  {viewMode === 'edit' && 'Code mode - Raw markdown editing'}
                  {viewMode === 'preview' && 'Preview mode - Read-only view'}
                </span>
              </div>
              {viewMode === 'live' && (
                <span className="text-xs text-blue-600 font-medium">Recommended</span>
              )}
            </div>
          )}

          {/* Smart Mode Suggestion */}
          {!readOnly && editorContent && suggestBestMode() !== viewMode && (
            <div className="flex items-center justify-between text-sm bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700">
                  {getContentComplexity() === 'complex' && 'Your content has tables - Split mode might be better for editing'}
                  {getContentComplexity() === 'moderate' && 'Consider Live mode for the best editing experience'}
                  {getContentComplexity() === 'simple' && 'Live mode is perfect for your content'}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode(suggestBestMode() as ViewMode)}
                className="text-purple-600 border-purple-200 hover:bg-purple-100"
              >
                Switch to {suggestBestMode() === 'split' ? 'Split' : 'Live'}
              </Button>
            </div>
          )}

          {/* Status Indicator */}
          {hasChanges && !readOnly && (
            <div className="flex items-center space-x-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-amber-700">You have unsaved changes</span>
            </div>
          )}

          {/* Editor Area */}
          <div className="space-y-4">
            {readOnly || viewMode === 'preview' ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="prose prose-sm max-w-none p-6 bg-white"
                  style={{ minHeight: editorHeight }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border border-gray-300 rounded-lg">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {children}
                        </td>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-6 first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-5 first:mt-0">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-gray-700">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 space-y-2 list-disc list-inside">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 space-y-2 list-decimal list-inside">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 leading-relaxed">
                          {children}
                        </li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                            {children}
                          </code>
                        ) : (
                          <code className={className}>{children}</code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {editorContent || ''}
                  </ReactMarkdown>
                </div>
              </div>
            ) : viewMode === 'live' ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <MDEditor
                  value={editorContent}
                  onChange={handleContentChange}
                  preview="preview"
                  hideToolbar={false}
                  height={editorHeight}
                  data-color-mode="light"
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder,
                    style: { 
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                    }
                  }}
                />
              </div>
            ) : viewMode === 'split' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <MDEditor
                    value={editorContent}
                    onChange={handleContentChange}
                    preview="edit"
                    hideToolbar={false}
                    height={editorHeight}
                    data-color-mode="light"
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder,
                      style: { 
                        fontSize: 14,
                        lineHeight: 1.5,
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                      }
                    }}
                  />
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="prose prose-sm max-w-none p-4 bg-white overflow-y-auto"
                    style={{ height: editorHeight }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {editorContent || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <MDEditor
                  value={editorContent}
                  onChange={handleContentChange}
                  preview="edit"
                  hideToolbar={false}
                  height={editorHeight}
                  data-color-mode="light"
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder,
                    style: { 
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {hasChanges ? (
                    <span className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Unsaved changes
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      All changes saved
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {editorContent.length} characters
                </div>
              </div>
              
              <div className="flex space-x-3">
                {onCancel && (
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedMarkdownEditor;