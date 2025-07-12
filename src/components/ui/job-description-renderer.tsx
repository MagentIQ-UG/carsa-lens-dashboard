/**
 * Job Description Renderer Component
 * Enhanced markdown renderer with proper table support and modern styling
 */

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Eye, Edit, Copy, Download, Share2, CheckCircle } from 'lucide-react';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface JobDescriptionRendererProps {
  content: string;
  title?: string;
  className?: string;
  showActions?: boolean;
  onEdit?: () => void;
  editable?: boolean;
  compact?: boolean;
}

export function JobDescriptionRenderer({
  content,
  title = "Job Description",
  className,
  showActions = false,
  onEdit,
  editable = false,
  compact = false
}: JobDescriptionRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy(); // Fallback to copy
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      {!compact && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-2">
                {editable && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "transition-all",
                    copied && "text-green-600 border-green-200 bg-green-50"
                  )}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={cn("p-0", !compact && "p-6 pt-0")}>
        <div className={cn(
          "prose prose-lg max-w-none",
          compact ? "p-4" : ""
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              // Table components with enhanced styling
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100 last:border-b-0">
                  {children}
                </td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  {children}
                </tr>
              ),
              
              // Enhanced heading styles
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 pb-3 border-b-2 border-blue-500">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-semibold text-gray-900 mb-5 mt-8 first:mt-0 pb-2 border-b border-gray-200">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-6 first:mt-0">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xl font-semibold text-gray-900 mb-3 mt-5 first:mt-0">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-lg font-semibold text-gray-900 mb-3 mt-4 first:mt-0">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-base font-semibold text-gray-900 mb-2 mt-4 first:mt-0">
                  {children}
                </h6>
              ),
              
              // Enhanced paragraph styling
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-gray-700 text-base">
                  {children}
                </p>
              ),
              
              // Enhanced list styling
              ul: ({ children }) => (
                <ul className="mb-6 space-y-2 list-none pl-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-6 space-y-2 list-decimal list-inside pl-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed flex items-start before:content-['•'] before:text-blue-500 before:text-lg before:mr-3 before:mt-1 before:flex-shrink-0">
                  <span className="flex-1">
                    {children}
                  </span>
                </li>
              ),
              
              // Enhanced blockquote styling
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gradient-to-r from-blue-50 to-transparent italic text-gray-700 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              
              // Enhanced code styling
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-gray-100 text-red-600 px-2 py-1 rounded-md text-sm font-mono border">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 border border-gray-200 shadow-sm">
                  {children}
                </pre>
              ),
              
              // Enhanced link styling
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              
              // Enhanced emphasis styling
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600">
                  {children}
                </em>
              ),
              
              // Horizontal rule styling
              hr: () => (
                <hr className="my-8 border-0 border-t-2 border-gray-200" />
              ),
              
              // Task list styling
              input: ({ type, checked }) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2 mt-1 transform scale-110 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  );
                }
                return <input type={type} />;
              },
            }}
          >
            {content || '*No content available*'}
          </ReactMarkdown>
        </div>
        
        {/* Word count and reading time */}
        {!compact && content && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{content.split(/\s+/).length} words</span>
              <span>•</span>
              <span>{Math.ceil(content.split(/\s+/).length / 200)} min read</span>
            </div>
            <div className="text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default JobDescriptionRenderer;