import React from 'react';

interface MarkdownRendererProps {
  text: string;
  baseSize?: 'sm' | 'base';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, baseSize = 'sm' }) => {
  const sizeClass = baseSize === 'base' ? 'text-base' : 'text-sm';
  // FIX: Pre-process text to handle escaped newlines from AI JSON output.
  const formattedText = text.replace(/\\n/g, '\n');

  const renderInlineMarkdown = (line: string): React.ReactNode => {
    // Regex to find ***bold/italic***, **bold**, or *italic*.
    // It's important to check for the longest match first to handle nesting correctly.
    const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={i}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const lines = formattedText.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className={`list-disc list-inside space-y-1 my-2 pl-4 ${sizeClass}`}>
          {listItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    // Headers
    if (line.trim().startsWith('### ')) {
      flushList();
      elements.push(<h3 key={i} className="font-semibold my-2 text-sm">{renderInlineMarkdown(line.substring(4))}</h3>);
      return;
    }
    if (line.trim().startsWith('## ')) {
      flushList();
      elements.push(<h2 key={i} className="text-base font-semibold my-2">{renderInlineMarkdown(line.substring(3))}</h2>);
      return;
    }
    if (line.trim().startsWith('# ')) {
      flushList();
      elements.push(<h1 key={i} className="text-lg font-bold my-2">{renderInlineMarkdown(line.substring(2))}</h1>);
      return;
    }

    // List items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      listItems.push(line.trim().substring(2));
      return;
    }
    
    // A non-list item line means any current list is finished.
    flushList();
    
    // Paragraphs
    if (line.trim()) {
      elements.push(
        <p key={i} className={`my-1 ${sizeClass} whitespace-pre-wrap`}>
          {renderInlineMarkdown(line)}
        </p>
      );
    }
    // Note: Empty lines are ignored, which is fine for collapsing multiple newlines.
  });

  // Render any remaining list items at the end
  flushList();
  
  return <>{elements}</>;
};

export default MarkdownRenderer;