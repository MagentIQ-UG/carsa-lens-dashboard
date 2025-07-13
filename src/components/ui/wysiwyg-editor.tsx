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
  height: _height = 400,
  onEnhance,
  enhanceLoading = false,
  isGeneratedContent = false
}: WysiwygEditorProps) {
  const [hasChanges, setHasChanges] = useState(false);
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
    editable: !readOnly,
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

  // Note: Preview toggle removed for simplified enterprise UX

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
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Fixed Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">Professional document editor</p>
                </div>
              </div>
              {isGeneratedContent && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-3 py-1 rounded-full">
                  <Wand2 className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">AI Generated</span>
                </div>
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
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100 font-medium"
                >
                  <Wand2 className={cn(
                    "h-4 w-4 mr-2",
                    enhanceLoading && "animate-spin"
                  )} />
                  {enhanceLoading ? 'Enhancing...' : 'Enhance with AI'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 mt-4">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Modern Status Bar */}
        {!readOnly && (
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900">Ready to edit</span>
              </div>
              <div className="h-4 w-px bg-blue-300"></div>
              <span className="text-sm text-blue-700">Format text using the toolbar or keyboard shortcuts</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <span className="font-medium">Microsoft Word-style editing</span>
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Status Indicator */}
        {hasChanges && !readOnly && (
          <div className="flex items-center space-x-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700">You have unsaved changes</span>
          </div>
        )}

        {/* Modern Toolbar */}
        {!readOnly && (
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Formatting</span>
              <span className="text-xs text-gray-500">Use shortcuts: Ctrl+B, Ctrl+I, etc.</span>
            </div>
            
            {/* Toolbar Content */}
            <div className="flex flex-wrap items-center gap-1 p-3">
              {/* Text formatting */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    'h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('bold') 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
                  )}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(
                    'h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('italic') 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
                  )}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </div>

              {/* Headers */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn(
                    'h-8 px-2 text-sm font-bold hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('heading', { level: 1 }) 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
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
                    'h-8 px-2 text-sm font-bold hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('heading', { level: 2 }) 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
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
                    'h-8 px-2 text-sm font-bold hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('heading', { level: 3 }) 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
                  )}
                  title="Heading 3"
                >
                  H3
                </Button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn(
                    'h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('bulletList') 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
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
                    'h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('orderedList') 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
                  )}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              {/* Quote & Table */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn(
                    'h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border transition-all',
                    editor.isActive('blockquote') 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-sm' 
                      : 'border-transparent'
                  )}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all"
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
                  className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-200 border border-transparent transition-all"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-200 border border-transparent transition-all"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

            {/* Scrollable Editor Container */}
            <div className="flex-1 flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Editor Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Document</span>
                  </div>
                  {editor && (
                    <div className="text-xs text-gray-500">
                      {editor.storage.characterCount?.words() || 0} words • {editor.storage.characterCount?.characters() || 0} characters
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {hasChanges && (
                    <div className="flex items-center space-x-1 text-xs text-amber-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Unsaved</span>
                    </div>
                  )}
                  {!hasChanges && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Saved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable Editor Content */}
              <div className="flex-1 overflow-y-auto bg-white">
                <EditorContent 
                  editor={editor} 
                  className={cn(
                    "h-full p-8 focus:outline-none prose prose-lg max-w-none",
                    // Microsoft Word-inspired styling
                    "[&_.ProseMirror]:outline-none",
                    "[&_.ProseMirror]:min-h-full",
                    "[&_.ProseMirror]:font-serif",
                    "[&_.ProseMirror]:text-gray-900",
                    "[&_.ProseMirror]:leading-relaxed",
                    "[&_.ProseMirror]:text-base",
                    // Typography hierarchy
                    "[&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-6 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:first:mt-0",
                    "[&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:mt-6",
                    "[&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:mt-5",
                    "[&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_p]:text-gray-800",
                    // Lists
                    "[&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ul]:pl-6",
                    "[&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_ol]:pl-6",
                    "[&_.ProseMirror_li]:mb-2 [&_.ProseMirror_li]:leading-relaxed",
                    // Tables
                    "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-gray-300 [&_.ProseMirror_table]:rounded-lg [&_.ProseMirror_table]:overflow-hidden [&_.ProseMirror_table]:my-6",
                    "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:bg-gray-50 [&_.ProseMirror_th]:p-3 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-gray-900",
                    "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-3 [&_.ProseMirror_td]:text-gray-800",
                    // Blockquotes
                    "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-6 [&_.ProseMirror_blockquote]:bg-blue-50 [&_.ProseMirror_blockquote]:py-4 [&_.ProseMirror_blockquote]:my-6 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-blue-900",
                    // Focus styles
                    "[&_.ProseMirror:focus]:outline-none",
                    "[&_.ProseMirror]:cursor-text"
                  )}
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer */}
      <Card className="flex-shrink-0 mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Document Status */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {hasChanges ? (
                    <>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-amber-700 font-medium">Editing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Saved</span>
                    </>
                  )}
                </div>
              </div>

              {/* Document Info */}
              <div className="text-sm text-gray-600">
                Compatible with all document formats
              </div>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
              <div className="flex items-center space-x-3">
                {onCancel && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={cn(
                    "shadow-sm font-medium",
                    hasChanges 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {hasChanges ? 'Save Changes' : 'Saved'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WysiwygEditor;