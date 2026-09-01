import type { ReactNode } from 'react';

function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-${i}`} className="text-2xs bg-suelo px-1 py-0.5 rounded-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  function flushList() {
    if (!list.length) return;
    const items = [...list];
    list = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-2">
        {items.map((item, i) => (
          <li key={i}>{inline(item, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>,
    );
  }

  lines.forEach((line, idx) => {
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      return;
    }
    flushList();
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={idx} className="text-sm font-medium text-ink mt-4 mb-1">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={idx} className="text-base font-medium text-ink mt-4 mb-1">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={idx} className="text-lg font-medium text-ink mt-3 mb-1">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.trim() === '') {
      blocks.push(<div key={idx} className="h-2" />);
    } else {
      blocks.push(
        <p key={idx} className="leading-relaxed">
          {inline(line, `p-${idx}`)}
        </p>,
      );
    }
  });
  flushList();

  return <div className="space-y-0.5 text-sm text-ink">{blocks}</div>;
}
