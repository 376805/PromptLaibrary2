/**
 * RealTimePreview Component
 * 
 * A component that provides real-time preview of prompt content with syntax highlighting
 * and markdown rendering capabilities.
 */

import React from 'react';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface RealTimePreviewProps {
  content: string;
}

/**
 * RealTimePreview component for rendering markdown content with syntax highlighting
 * @param content - The markdown content to preview
 */
export const RealTimePreview: React.FC<RealTimePreviewProps> = ({ content }) => {
  /**
   * Custom renderer for code blocks
   * Provides syntax highlighting for code snippets
   */
  const CodeBlock = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';

      return !inline ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={CodeBlock}
        className="markdown-preview"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};