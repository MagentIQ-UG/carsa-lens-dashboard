/**
 * Document Viewer
 * Clean, focused document viewing experience
 * Optimized for reading and review workflows
 */

'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  content: string;
  className?: string;
}

// Convert markdown to clean HTML for viewing
const markdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) return '<p class="text-gray-500 italic">No content available</p>';

  let html = markdown;

  // Handle tables first
  html = html.replace(/\|(.+)\|\n\|[\s\-\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
    const headerCells = header.split('|').map((cell: string) => cell.trim()).filter(Boolean);
    const headerRow = headerCells.map((cell: string) => `<th class="border border-gray-300 bg-gray-50 p-3 font-semibold text-gray-900 text-left">${cell}</th>`).join('');
    
    const bodyRows = rows.split('\n').filter(Boolean).map((row: string) => {
      const cells = row.split('|').map((cell: string) => cell.trim()).filter(Boolean);
      return '<tr>' + cells.map((cell: string) => `<td class="border border-gray-300 p-3 text-gray-800">${cell}</td>`).join('') + '</tr>';
    }).join('');
    
    return `<table class="border-collapse border border-gray-300 rounded-lg overflow-hidden my-6 w-full"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  // Handle lists
  html = html.replace(/^(\s*)[-+*] (.+)$/gm, '<li class="mb-2 leading-relaxed">$2</li>');
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, '<li class="mb-2 leading-relaxed">$2</li>');
  html = html.replace(/(<li[^>]*>.*?<\/li>)/g, '<ul class="mb-4 pl-6">$1</ul>');

  // Handle headers (order matters - largest first)
  html = html.replace(/^###### (.*$)/gm, '<h6 class="text-lg font-semibold text-gray-900 mb-3 mt-5">$1</h6>');
  html = html.replace(/^##### (.*$)/gm, '<h5 class="text-xl font-semibold text-gray-900 mb-3 mt-5">$1</h5>');
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-xl font-semibold text-gray-900 mb-3 mt-5">$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-2xl font-semibold text-gray-900 mb-4 mt-6">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-3xl font-semibold text-gray-900 mb-4 mt-6">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">$1</h1>');

  // Handle bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Handle blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-6 bg-blue-50 py-4 my-6 italic text-blue-900">$1</blockquote>');

  // Handle paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-800">');
  html = html.replace(/^(?!<[ht]|<ul|<ol|<table|<blockquote)/gm, '<p class="mb-4 leading-relaxed text-gray-800">').replace(/(?![>])$/gm, '</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  html = html.replace(/<p[^>]*>(<[h1-6]|<ul|<ol|<table|<blockquote)/g, '$1');
  html = html.replace(/(<\/[h1-6]>|<\/ul>|<\/ol>|<\/table>|<\/blockquote>)<\/p>/g, '$1');

  // Handle line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
};

export function DocumentViewer({ content, className }: DocumentViewerProps) {
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    const htmlContent = markdownToHtml(content);
    setProcessedContent(htmlContent);
  }, [content]);

  if (!content?.trim()) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <div className="text-center">
          <p className="text-gray-500 italic">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <article 
        className={cn(
          "prose prose-lg max-w-none p-8",
          // Typography and spacing
          "font-serif text-gray-900 leading-relaxed text-lg",
          // Custom prose styles
          "prose-headings:font-serif prose-headings:text-gray-900",
          "prose-p:text-gray-800 prose-p:leading-relaxed",
          "prose-li:text-gray-800",
          "prose-strong:text-gray-900 prose-strong:font-semibold",
          "prose-em:italic",
          // Table styles
          "prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-6",
          "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:font-semibold prose-th:text-gray-900 prose-th:text-left",
          "prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-800",
          // Blockquote styles
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-blue-900",
          // List styles
          "prose-ul:pl-6 prose-ol:pl-6",
          "prose-li:mb-2 prose-li:leading-relaxed"
        )}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}

export default DocumentViewer;