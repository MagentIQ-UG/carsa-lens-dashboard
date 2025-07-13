/**
 * Document Editor
 * Clean, focused document editing experience
 * Designed to work within DocumentReviewContainer
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
} from 'lucide-react';

import { Button } from './button';
import { cn } from '@/lib/utils';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  autoFocus?: boolean;
}

// Utility functions for markdown conversion
const htmlToMarkdown = (html: string): string => {
  let markdown = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // Handle tables
  markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    let tableMarkdown = '\n';
    const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    
    rows.forEach((row: string, rowIndex: number) => {
      const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
      const cellTexts = cells.map((cell: string) => {
        return cell.replace(/<[^>]+>/g, '').trim();
      });
      
      tableMarkdown += '| ' + cellTexts.join(' | ') + ' |\n';
      
      if (rowIndex === 0) {
        tableMarkdown += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
      }
    });
    
    return tableMarkdown + '\n';
  });

  // Handle lists
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

  return markdown
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

const markdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) return '<p></p>';

  let html = markdown;

  // Handle tables
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

  // Handle headers
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

export function DocumentEditor({
  content,
  onChange,
  readOnly = false,
  placeholder = "Start writing your document...",
  className,
  showToolbar = true,
  autoFocus = false
}: DocumentEditorProps) {
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
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const markdownContent = htmlToMarkdown(htmlContent);
      onChange(markdownContent);
    },
  });

  useEffect(() => {
    if (editor && content) {
      const htmlContent = markdownToHtml(content);
      if (editor.getHTML() !== htmlContent) {
        editor.commands.setContent(htmlContent);
      }
    }
  }, [editor, content]);

  if (!isMounted || !editor) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Floating Toolbar */}
      {showToolbar && !readOnly && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-1">
              {/* Typography */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn(
                    'h-8 px-2 text-sm font-bold',
                    editor.isActive('heading', { level: 1 }) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
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
                    'h-8 px-2 text-sm font-bold',
                    editor.isActive('heading', { level: 2 }) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
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
                    'h-8 px-2 text-sm font-bold',
                    editor.isActive('heading', { level: 3 }) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  )}
                  title="Heading 3"
                >
                  H3
                </Button>
              </div>

              {/* Formatting */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('bold') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
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
                    'h-8 w-8 p-0',
                    editor.isActive('italic') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  )}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </div>

              {/* Lists */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('bulletList') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
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
                    'h-8 w-8 p-0',
                    editor.isActive('orderedList') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  )}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              {/* Quote & Table */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-3 mr-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn(
                    'h-8 w-8 p-0',
                    editor.isActive('blockquote') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  )}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Insert Table"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Word Count */}
            <div className="text-xs text-gray-500">
              {editor.storage.characterCount?.words() || 0} words
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <EditorContent 
          editor={editor} 
          className={cn(
            "h-full prose prose-lg max-w-none focus:outline-none",
            // Document styling
            "[&_.ProseMirror]:h-full",
            "[&_.ProseMirror]:p-8",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror]:font-serif",
            "[&_.ProseMirror]:text-gray-900",
            "[&_.ProseMirror]:leading-relaxed",
            "[&_.ProseMirror]:text-lg",
            // Typography
            "[&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-6 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:first:mt-0",
            "[&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:mt-6",
            "[&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:mt-5",
            "[&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_p]:text-gray-800",
            // Lists
            "[&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ul]:pl-6",
            "[&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_ol]:pl-6",
            "[&_.ProseMirror_li]:mb-2 [&_.ProseMirror_li]:leading-relaxed",
            // Tables
            "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-gray-300 [&_.ProseMirror_table]:rounded-lg [&_.ProseMirror_table]:overflow-hidden [&_.ProseMirror_table]:my-6 [&_.ProseMirror_table]:w-full",
            "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:bg-gray-50 [&_.ProseMirror_th]:p-3 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-gray-900 [&_.ProseMirror_th]:text-left",
            "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-3 [&_.ProseMirror_td]:text-gray-800",
            // Blockquotes
            "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-6 [&_.ProseMirror_blockquote]:bg-blue-50 [&_.ProseMirror_blockquote]:py-4 [&_.ProseMirror_blockquote]:my-6 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-blue-900",
            // Placeholder
            "[&_.ProseMirror]:before:content-[attr(data-placeholder)] [&_.ProseMirror]:before:text-gray-400 [&_.ProseMirror]:before:pointer-events-none [&_.ProseMirror]:before:float-left [&_.ProseMirror]:before:h-0",
            "data-[placeholder]:before:content-[attr(data-placeholder)]"
          )}
          style={{
            '--placeholder': `"${placeholder}"`
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

export default DocumentEditor;