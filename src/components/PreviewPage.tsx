import React, { useState } from 'react';
import { Check, Wand2, Copy, Download } from 'lucide-react';
import { Modal } from './Modal';
import { enhancePrompt } from '../services/apiSelector';
import hljs from 'highlight.js';

interface PreviewPageProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onBack: () => void;
  onCopy: () => Promise<void>;
  showCopySuccess: boolean;
  onSubmit?: () => void;
}

interface SnippetBlockProps {
  snippet: CodeSnippet;
  index: number;
}

interface CodeSnippet {
  type: string;
  content: string;
  language: string;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({
  isOpen,
  onClose,
  content,
  onBack,
  onCopy,
  showCopySuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [showResponseCopySuccess, setShowResponseCopySuccess] = useState(false);

  const handleSubmitToLLM = async () => {
    setIsLoading(true);
    try {
      const response = await enhancePrompt(content);
      setLlmResponse(response);
      setIsResponseModalOpen(true);
    } catch (error) {
      console.error('Error submitting to LLM:', error);
      alert('Failed to get LLM response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    if (llmResponse) {
      try {
        await navigator.clipboard.writeText(llmResponse);
        setShowResponseCopySuccess(true);
        setTimeout(() => setShowResponseCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy response:', err);
        alert('Failed to copy to clipboard');
      }
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enhanced file extension mapping
  const getFileExtension = (language: string, type: string): string => {
    const extensionMap: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      tsx: 'tsx',
      jsx: 'jsx',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'c',
      csharp: 'cs',
      'c#': 'cs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
      go: 'go',
      rust: 'rs',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      sql: 'sql',
      shell: 'sh',
      bash: 'sh',
      zsh: 'sh',
      yaml: 'yml',
      json: 'json',
      xml: 'xml',
      markdown: 'md',
      plaintext: 'txt'
    };

    return extensionMap[language.toLowerCase()] || 'txt';
  };

  // Enhanced function to detect and generate appropriate file name
  const detectCodeName = (content: string, language: string): string => {
    // Try to find class name
    const classMatch = content.match(/(?:class|interface|enum)\s+(\w+)/);
    if (classMatch) return `${classMatch[1]}`;

    // Try to find function name
    const functionMatch = content.match(/(?:function|const|let|var)\s+(\w+)\s*(?:=|\()/);
    if (functionMatch) return `${functionMatch[1]}`;

    // Try to find React component name
    const reactComponentMatch = content.match(/(?:function|const|class)\s+(\w+)(?:\s+extends\s+React\.Component|\s*:\s*React\.FC|\s*=\s*\([^)]*\)\s*=>)/);
    if (reactComponentMatch) return `${reactComponentMatch[1]}Component`;

    // Try to find API route
    const apiRouteMatch = content.match(/(?:router|app)\.(?:get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/);
    if (apiRouteMatch) {
      const route = apiRouteMatch[1].replace(/[\/\-]/g, '_').replace(/[^\w]/g, '');
      return `${route}_api`;
    }

    // Generate name based on content type and timestamp
    const timestamp = new Date().getTime();
    const shortLang = language.toLowerCase().replace(/[^\w]/g, '');
    return `${shortLang}_snippet_${timestamp}`;
  };

  const SnippetBlock: React.FC<SnippetBlockProps> = ({ snippet, index }) => {
    const highlightedCode = hljs.highlight(snippet.language, snippet.content).value;

    return (
      <div className="mt-4 first:mt-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {snippet.language ? `${snippet.language}` : 'plaintext'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(snippet.content)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy snippet"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(snippet.content, `${detectCodeName(snippet.content, snippet.language)}.${getFileExtension(snippet.language, snippet.type)}`)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Download snippet"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <pre className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-200 dark:border-gray-700">
          <code
            className={`language-${snippet.language || 'plaintext'} text-sm text-gray-800 dark:text-gray-200`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex justify-between items-center h-12">
                <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Preview Content</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onCopy}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors flex items-center space-x-2"
                  >
                    {showCopySuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy Content</span>
                    )}
                  </button>
                  {showCopySuccess && (
                    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-2 transition-all duration-300 ease-in-out">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Content copied to clipboard!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-900">
            <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 font-mono text-sm">
              {content}
            </pre>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex justify-between items-center">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitToLLM}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Wand2 className="w-4 h-4" />
                  {isLoading ? 'Processing...' : 'Submit to LLM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* LLM Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="LLM Response"
        size="4xl"
      >
        <div className="bg-white dark:bg-gray-900 min-h-[200px]">
          <div className="flex justify-end mb-6 px-6">
            <button
              onClick={handleCopyResponse}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors flex items-center space-x-2 shadow-sm"
            >
              {showResponseCopySuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Response</span>
                </>
              )}
            </button>
          </div>
          <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none px-6 pb-6">
            {llmResponse && (
              <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-6 last:mb-0">
                {llmResponse.split('```').map((block, index) => {
                  if (index % 2 === 1) {
                    // This is a code block
                    const [language, ...codeLines] = block.split('\n');
                    const code = codeLines.join('\n');
                    const highlightedCode = hljs.highlight(language || 'plaintext', code).value;
                    const fileName = `${detectCodeName(code, language || 'plaintext')}.${getFileExtension(language || 'plaintext', 'code')}`;
                    
                    return (
                      <div key={index} className="mt-4 first:mt-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {language ? `${language}` : 'plaintext'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(code)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Copy code"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(code, fileName)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Download code"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-200 dark:border-gray-700">
                          <code
                            className={`language-${language || 'plaintext'} text-sm`}
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                          />
                        </pre>
                      </div>
                    );
                  }
                  // This is regular text
                  return (
                    <div key={index} className="prose dark:prose-invert max-w-none mb-4">
                      {block}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
