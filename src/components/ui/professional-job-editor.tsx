/**
 * Professional Job Description Editor
 * Modern, intuitive editor with rich formatting and table support
 * Built using React Markdown and MDEditor for better compatibility
 */

'use client';

import '@uiw/react-md-editor/markdown-editor.css';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Save,
  Eye,
  Edit3,
  Wand2,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  Type,
  FileText,
  Monitor,
  Split
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

// Dynamically import MD Editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    )
  }
);

type ViewMode = 'live' | 'edit' | 'preview' | 'split';

interface ProfessionalJobEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onEnhance?: () => void;
  title?: string;
  placeholder?: string;
  readOnly?: boolean;
  enhanceLoading?: boolean;
  isGeneratedContent?: boolean;
  hasChanges?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function ProfessionalJobEditor({
  content,
  onChange,
  onSave,
  onCancel,
  onEnhance,
  title = "Job Description Editor",
  placeholder = "Start writing your job description...",
  readOnly = false,
  enhanceLoading = false,
  isGeneratedContent = false,
  hasChanges = false,
  className,
  autoFocus = false
}: ProfessionalJobEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(readOnly ? 'preview' : 'live');
  const [editorContent, setEditorContent] = useState(content);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setEditorContent(content);
  }, [content]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setEditorContent(newContent);
    onChange(newContent);
  };

  const handleSave = () => {
    onSave?.();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    setEditorContent(content);
    onCancel?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getWordCount = () => {
    return editorContent ? editorContent.split(/\s+/).filter(Boolean).length : 0;
  };

  const getCharCount = () => {
    return editorContent ? editorContent.length : 0;
  };

  // Suggest best mode based on content complexity
  const suggestBestMode = (): ViewMode => {
    if (!editorContent) return 'live';
    
    const hasComplexElements = editorContent.includes('|') || // tables
                              editorContent.includes('```') || // code blocks
                              editorContent.includes('[') || // links/images
                              editorContent.split('\n').length > 20; // long content
    
    return hasComplexElements ? 'split' : 'live';
  };

  const getCurrentModeDescription = () => {
    switch (viewMode) {
      case 'live':
        return 'Live editing - See changes as you type with inline preview';
      case 'split':
        return 'Split view - Edit and preview side by side';
      case 'edit':
        return 'Edit mode - Pure markdown editing with toolbar';
      case 'preview':
        return 'Preview mode - Read-only formatted view';
      default:
        return '';
    }
  };

  if (!isMounted) {
    return (
      <div className="h-96 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'w-full transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 bg-white p-6',
        className
      )}
    >
      <Card className={cn('h-full shadow-lg border-gray-200', isFullscreen && 'h-full')}>
        {/* Header */}
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Type className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-1">
                  {isGeneratedContent && (
                    <Badge variant="secondary" className="text-xs">
                      <Wand2 className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                  {hasChanges && (
                    <Badge variant="warning" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                  {!hasChanges && !readOnly && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              {!readOnly && (
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <Button
                    variant={viewMode === 'live' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('live')}
                    className="rounded-r-none border-r"
                    title="Live editing with instant preview"
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Live
                  </Button>
                  <Button
                    variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('split')}
                    className="rounded-none border-r"
                    title="Side-by-side editing and preview"
                  >
                    <Split className="h-4 w-4 mr-1" />
                    Split
                  </Button>
                  <Button
                    variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('edit')}
                    className="rounded-none border-r"
                    title="Pure markdown editing"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
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

              {/* AI Enhancement */}
              {onEnhance && !readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnhance}
                  disabled={enhanceLoading}
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100"
                >
                  <Wand2 className={cn("h-4 w-4 mr-1", enhanceLoading && "animate-spin")} />
                  {enhanceLoading ? 'Enhancing...' : 'Enhance'}
                </Button>
              )}

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mode Description */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">{getCurrentModeDescription()}</span>
            </div>
          </div>

          {/* Smart Mode Suggestion */}
          {!readOnly && editorContent && suggestBestMode() !== viewMode && (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">
                    For your content type, we recommend using <strong>{suggestBestMode()}</strong> mode
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode(suggestBestMode())}
                  className="text-purple-600 border-purple-200 hover:bg-purple-100"
                >
                  Switch to {suggestBestMode()}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-full">
          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              "h-full",
              isFullscreen ? "min-h-[calc(100vh-320px)]" : "min-h-[500px]"
            )}>
              {readOnly || viewMode === 'preview' ? (
                // Preview Only Mode
                <div className="h-full overflow-y-auto bg-white">
                  <div className="max-w-4xl mx-auto p-8">
                    <article className="prose prose-lg max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          // Custom table styling
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-gray-50">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300 border-r border-gray-300 last:border-r-0">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200 border-r border-gray-200 last:border-r-0">
                              {children}
                            </td>
                          ),
                          // Enhanced headings
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b border-gray-200 pb-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-6">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-5">
                              {children}
                            </h3>
                          ),
                          // Enhanced lists
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
                            <li className="text-gray-700 leading-relaxed ml-2">
                              {children}
                            </li>
                          ),
                          // Enhanced paragraphs
                          p: ({ children }) => (
                            <p className="mb-4 leading-relaxed text-gray-700">
                              {children}
                            </p>
                          ),
                          // Enhanced blockquotes
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-6 bg-blue-50 py-4 my-6 italic text-blue-900">
                              {children}
                            </blockquote>
                          ),
                          // Code blocks
                          pre: ({ children }) => (
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                              {children}
                            </pre>
                          ),
                          code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {editorContent || '*No content yet. Start writing to see your job description here.*'}
                      </ReactMarkdown>
                    </article>
                  </div>
                </div>
              ) : viewMode === 'split' ? (
                // Split Mode
                <div className="h-full flex">
                  {/* Editor Side */}
                  <div className="w-1/2 border-r border-gray-200">
                    <MDEditor
                      value={editorContent}
                      onChange={handleContentChange}
                      preview="edit"
                      hideToolbar={false}
                      height="100%"
                      data-color-mode="light"
                      visibleDragbar={false}
                      textareaProps={{
                        placeholder,
                        autoFocus,
                        style: { 
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                        }
                      }}
                    />
                  </div>
                  {/* Preview Side */}
                  <div className="w-1/2 overflow-y-auto bg-white">
                    <div className="p-6">
                      <article className="prose prose-lg max-w-none">
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
                            thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                            th: ({ children }) => (
                              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-sm text-gray-800 border-b border-gray-200">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {editorContent || '*Start typing to see the preview...*'}
                        </ReactMarkdown>
                      </article>
                    </div>
                  </div>
                </div>
              ) : (
                // Live/Edit Mode
                <MDEditor
                  value={editorContent}
                  onChange={handleContentChange}
                  preview={viewMode === 'live' ? 'preview' : 'edit'}
                  hideToolbar={false}
                  height="100%"
                  data-color-mode="light"
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder,
                    autoFocus,
                    style: { 
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          {!readOnly && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                <span>{getWordCount()} words • {getCharCount()} characters</span>
                {viewMode === 'split' && (
                  <span className="text-purple-600">Split view active</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                {onCancel && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                {onSave && (
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {hasChanges ? 'Save Changes' : 'Saved'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfessionalJobEditor;
