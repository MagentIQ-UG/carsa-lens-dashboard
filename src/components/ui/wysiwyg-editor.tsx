/**
 * WYSIWYG Editor Component
 * True Microsoft Word-like editing experience - no markdown visible!
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Table as TableIcon,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  Wand2
} from 'lucide-react';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface WysiwygEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
  height?: number;
  onEnhance?: () => void;
  enhanceLoading?: boolean;
  isGeneratedContent?: boolean;
}

// Convert HTML to markdown for backend compatibility
const htmlToMarkdown = (html: string): string => {
  // Clean up the HTML first
  let markdown = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // Handle tables first (most complex)
  markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    let tableMarkdown = '\n';
    const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    
    rows.forEach((row: string, rowIndex: number) => {
      const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
      const cellTexts = cells.map((cell: string) => {
        return cell.replace(/<[^>]+>/g, '').trim();
      });
      
      tableMarkdown += '| ' + cellTexts.join(' | ') + ' |\n';
      
      // Add separator after header row
      if (rowIndex === 0) {
        tableMarkdown += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
      }
    });
    
    return tableMarkdown + '\n';
  });

  // Handle lists properly
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
    const items = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    return '\n' + items.map((item: string) => {
      const text = item.replace(/<[^>]+>/g, '').trim();
      return `- ${text}`;
    }).join('\n') + '\n\n';
  });

  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
    const items = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    return '\n' + items.map((item: string, index: number) => {
      const text = item.replace(/<[^>]+>/g, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n\n';
  });

  // Handle other elements
  return markdown
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold and Italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Clean up remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up excessive whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

// Convert markdown to HTML for display
const markdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) return '<p></p>';

  let html = markdown;

  // Handle tables first
  html = html.replace(/\|(.+)\|\n\|[\s\-\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
    const headerCells = header.split('|').map((cell: string) => cell.trim()).filter(Boolean);
    const headerRow = headerCells.map((cell: string) => `<th>${cell}</th>`).join('');
    
    const bodyRows = rows.split('\n').filter(Boolean).map((row: string) => {
      const cells = row.split('|').map((cell: string) => cell.trim()).filter(Boolean);
      return '<tr>' + cells.map((cell: string) => `<td>${cell}</td>`).join('') + '</tr>';
    }).join('');
    
    return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  // Handle lists
  html = html.replace(/^(\s*)[-+*] (.+)$/gm, '<li>$2</li>');
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

  // Handle headers (order matters - largest first)
  html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Handle bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Handle paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/^(?!<[ht])/gm, '<p>').replace(/(?![>])$/gm, '</p>');

  // Clean up
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[h1-6]|<ul|<ol|<table|<blockquote)/g, '$1');
  html = html.replace(/(<\/[h1-6]>|<\/ul>|<\/ol>|<\/table>|<\/blockquote>)<\/p>/g, '$1');

  return html;
};

export function WysiwygEditor({
  content,
  onSave,
  onCancel,
  title = "Content Editor",
  className,
  readOnly = false,
  placeholder: _placeholder = "Start writing...",
  height = 400,
  onEnhance,
  enhanceLoading = false,
  isGeneratedContent = false
}: WysiwygEditorProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      CharacterCount,
    ],
    content: markdownToHtml(content),
    editable: !readOnly && !isPreview,
    immediatelyRender: false,
    onUpdate: ({ editor: _editor }) => {
      setHasChanges(true);
    },
  });

  useEffect(() => {
    if (editor && content) {
      const htmlContent = markdownToHtml(content);
      if (editor.getHTML() !== htmlContent) {
        editor.commands.setContent(htmlContent);
        setHasChanges(false);
      }
    }
  }, [editor, content]);

  const handleSave = () => {
    if (editor) {
      const htmlContent = editor.getHTML();
      const markdownContent = htmlToMarkdown(htmlContent);
      onSave(markdownContent);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    if (editor) {
      editor.commands.setContent(markdownToHtml(content));
      setHasChanges(false);
    }
    onCancel?.();
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
    if (editor) {
      editor.setEditable(!isPreview && !readOnly);
    }
  };

  if (!isMounted || !editor) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading editor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
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

            {/* Preview Toggle */}
            {!readOnly && (
              <Button
                variant={isPreview ? "primary" : "outline"}
                size="sm"
                onClick={togglePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User-friendly information */}
        {!readOnly && !isPreview && (
          <div className="flex items-center space-x-2 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">
              Edit content directly - bold, italic, headers, and tables work just like Microsoft Word!
            </span>
          </div>
        )}

        {/* Status Indicator */}
        {hasChanges && !readOnly && (
          <div className="flex items-center space-x-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700">You have unsaved changes</span>
          </div>
        )}

        {/* Toolbar */}
        {!readOnly && !isPreview && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            {/* Text formatting */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'p-2',
                  editor.isActive('bold') && 'bg-blue-100 text-blue-600'
                )}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'p-2',
                  editor.isActive('italic') && 'bg-blue-100 text-blue-600'
                )}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </div>

            {/* Headers */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  'p-2 text-sm font-bold',
                  editor.isActive('heading', { level: 1 }) && 'bg-blue-100 text-blue-600'
                )}
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  'p-2 text-sm font-bold',
                  editor.isActive('heading', { level: 2 }) && 'bg-blue-100 text-blue-600'
                )}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(
                  'p-2 text-sm font-bold',
                  editor.isActive('heading', { level: 3 }) && 'bg-blue-100 text-blue-600'
                )}
                title="Heading 3"
              >
                H3
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  'p-2',
                  editor.isActive('bulletList') && 'bg-blue-100 text-blue-600'
                )}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  'p-2',
                  editor.isActive('orderedList') && 'bg-blue-100 text-blue-600'
                )}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            {/* Quote */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  'p-2',
                  editor.isActive('blockquote') && 'bg-blue-100 text-blue-600'
                )}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            {/* Table */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                title="Insert Table"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Editor */}
        <div 
          className={cn(
            "border border-gray-200 rounded-lg overflow-hidden bg-white",
            !readOnly && !isPreview && "min-h-[400px]"
          )}
          style={{ minHeight: height }}
        >
          <EditorContent 
            editor={editor} 
            className={cn(
              "p-6 focus:outline-none prose prose-lg max-w-none",
              !readOnly && !isPreview && "min-h-[350px]",
              // MS Word-like styling
              "[&_.ProseMirror]:outline-none",
              "[&_.ProseMirror]:min-h-full",
              "[&_.ProseMirror]:font-serif",
              "[&_.ProseMirror]:text-gray-900",
              "[&_.ProseMirror]:leading-relaxed",
              "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4",
              "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3",
              "[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2",
              "[&_.ProseMirror_p]:mb-3",
              "[&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:mb-3",
              "[&_.ProseMirror_li]:mb-1",
              "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-gray-300",
              "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:bg-gray-50 [&_.ProseMirror_th]:p-2",
              "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-2",
              "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:bg-blue-50 [&_.ProseMirror_blockquote]:py-2"
            )}
          />
        </div>

        {/* Word count and character count */}
        {editor && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{editor.storage.characterCount?.characters() || 0} characters</span>
              <span>•</span>
              <span>{editor.storage.characterCount?.words() || 0} words</span>
            </div>
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
        )}

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Content is saved in a format compatible with all systems
            </div>
            
            <div className="flex space-x-3">
              {onCancel && (
                <Button variant="outline" onClick={handleCancel}>
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
  );
}

export default WysiwygEditor;