// lib/markdown-lite.js
// Tiny, dependency-free renderer for the handful of markdown-style patterns
// used in lib/posts.js content: ## / ### headings, "- " bullet lists,
// **bold** text, and [label](url) links. Not a general markdown parser —
// just enough to keep blog content easy to write as plain text.
import Link from "next/link";

function parseInline(text, keyPrefix) {
  const nodes = [];
  // Combined pattern for **bold** and [label](url)
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{match[1]}</strong>);
    } else {
      const isInternal = match[3].startsWith("/");
      nodes.push(
        isInternal ? (
          <Link key={`${keyPrefix}-l-${i}`} href={match[3]} className="inline-link">
            {match[2]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l-${i}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            {match[2]}
          </a>
        )
      );
    }
    lastIndex = pattern.lastIndex;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function renderContent(content) {
  const blocks = content.trim().split("\n\n");
  const elements = [];

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx}>{parseInline(trimmed.slice(4), idx)}</h3>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={idx}>{parseInline(trimmed.slice(3), idx)}</h2>);
      return;
    }

    const lines = trimmed.split("\n");
    const hasBullets = lines.some((l) => l.trim().startsWith("- "));

    if (!hasBullets) {
      // Plain paragraph (join wrapped lines with a space)
      elements.push(<p key={idx}>{parseInline(lines.join(" "), idx)}</p>);
      return;
    }

    // Mixed block: optional intro sentence(s), then a bullet list. Lines
    // that don't start with "- " are treated as a wrapped continuation of
    // the previous bullet (or the intro, if no bullet has started yet).
    const introLines = [];
    const items = [];
    lines.forEach((line) => {
      const t = line.trim();
      if (t.startsWith("- ")) {
        items.push(t.slice(2));
      } else if (items.length > 0) {
        items[items.length - 1] += " " + t;
      } else {
        introLines.push(t);
      }
    });

    if (introLines.length > 0) {
      elements.push(<p key={`${idx}-intro`}>{parseInline(introLines.join(" "), `${idx}-intro`)}</p>);
    }
    elements.push(
      <ul key={idx}>
        {items.map((item, li) => (
          <li key={li}>{parseInline(item, `${idx}-${li}`)}</li>
        ))}
      </ul>
    );
  });

  return elements;
}


