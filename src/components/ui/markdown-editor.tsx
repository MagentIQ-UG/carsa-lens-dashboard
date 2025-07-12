/**
 * Markdown Editor Component
 * Rich text editor with markdown preview for scorecard content
 */

'use client';

import { useState } from 'react';
import { Eye, Edit, Bold, Italic, List, ListOrdered, Quote, Code, Save, X } from 'lucide-react';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  title?: string;
  className?: string;
  readOnly?: boolean;
}

export function MarkdownEditor({ 
  content, 
  onSave, 
  onCancel, 
  title = "Content Editor",
  className,
  readOnly = false 
}: MarkdownEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (value: string) => {
    setEditorContent(value);
    setHasChanges(value !== content);
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
    onCancel();
  };

  // Format helpers
  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const newText = `${prefix}${selectedText}${suffix}`;
    
    const before = editorContent.substring(0, start);
    const after = editorContent.substring(end);
    const updatedContent = before + newText + after;
    
    handleContentChange(updatedContent);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Markdown rendering (simple implementation)
  const renderMarkdown = (text: string) => {
    const html = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return html;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            {!readOnly && (
              <>
                <Button
                  variant={isPreview ? "outline" : "primary"}
                  size="sm"
                  onClick={() => setIsPreview(false)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={isPreview ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setIsPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        {!readOnly && !isPreview && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('**', '**')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('*', '*')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('`', '`')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('\n- ', '')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('\n1. ', '')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormat('\n> ', '')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Editor/Preview */}
        {isPreview || readOnly ? (
          <div 
            className="min-h-96 p-4 border border-gray-200 rounded-lg bg-white prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(editorContent) }}
          />
        ) : (
          <textarea
            id="markdown-editor"
            value={editorContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full min-h-96 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter your markdown content here..."
          />
        )}

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="text-orange-600">• Unsaved changes</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarkdownEditor;