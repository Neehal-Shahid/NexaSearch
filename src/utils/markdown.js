export function parseMarkdown(text) {
  if (!text) return '';

  const codeBlocks = [];
  const inlineCodes = [];

  // Placeholders use '@@' — deliberately not '_' or '*', since those are
  // markdown syntax characters that get regex-replaced further down (e.g.
  // the italic-underscore rule below matches "_CODE_" inside a token like
  // "__CODE_BLOCK_0__", corrupting it before the final placeholder swap
  // could find it — that previously broke every code block/inline code
  // span containing an underscore).

  // 1. Extract code blocks and replace with placeholders
  let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `@@NEXACODEBLOCK${codeBlocks.length}@@`;
    const encodedCode = encodeURIComponent(code);
    codeBlocks.push(`
      <div class="my-5 bg-background border border-border-subtle rounded-xl overflow-hidden shadow-sm relative group">
        <div class="flex items-center justify-between px-4 py-2 bg-accent border-b border-accent-hover">
          <span class="text-xs font-bold text-white uppercase tracking-wider">${lang || 'CODE'}</span>
          <button class="copy-code-btn text-xs font-medium text-white/80 hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none" data-code="${encodedCode}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span>Copy code</span>
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-[13.5px] leading-relaxed text-text-primary whitespace-pre font-mono"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    `);
    return placeholder;
  });

  // 2. Extract inline code spans to placeholders too — for the same reason
  // as code blocks. Restoring the actual <code> HTML only at the very end
  // (instead of inserting it here) protects code content like "num_1" or
  // "my*ptr" from being mangled by the bold/italic/strikethrough passes below.
  processedText = processedText.replace(/`([^`]+)`/g, (match, p1) => {
    const placeholder = `@@NEXAINLINECODE${inlineCodes.length}@@`;
    inlineCodes.push(`<code class="bg-surface-secondary border border-border-subtle px-1.5 py-0.5 rounded-md font-mono text-[13.5px] text-text-primary">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`);
    return placeholder;
  });

  // 3. Parse bold: **text** -> <strong>text</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-accent">$1</strong>');

  // 4. Parse italic: *text* -> <em>text</em>
  processedText = processedText.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  processedText = processedText.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 5. Parse Links: [text](url) -> <a>text</a>
  processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

  // 6. Parse Strikethrough: ~~text~~ -> <del>text</del>
  processedText = processedText.replace(/~~(.*?)~~/g, '<del class="text-text-muted line-through">$1</del>');

  // 7. Parse lists, paragraphs, headings, blockquotes, and dividers
  const lines = processedText.split('\n');
  let resultHtml = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Code blocks
    if (line.match(/^@@NEXACODEBLOCK\d+@@$/)) {
      if (inList) {
        resultHtml += '</ul>';
        inList = false;
      }
      resultHtml += line; // Insert placeholder, no <br/> needed
      continue;
    }
    
    // Horizontal Rules
    if (line === '---' || line === '***' || line === '___') {
        if (inList) {
            resultHtml += '</ul>';
            inList = false;
        }
        resultHtml += '<hr class="border-border-subtle my-6" />';
        continue;
    }

    const isUnorderedList = line.startsWith('* ') || line.startsWith('- ');
    const isOrderedListMatch = line.match(/^(\d+)\.\s(.*)/);

    if (isUnorderedList || isOrderedListMatch) {
      if (!inList) {
        const listTag = isOrderedListMatch ? 'ol' : 'ul';
        const listClass = isOrderedListMatch ? 'list-decimal ml-6 mt-2 mb-2 space-y-1' : 'list-disc ml-6 mt-2 mb-2 space-y-1';
        resultHtml += `<${listTag} class="${listClass}" data-type="${listTag}">`;
        inList = listTag;
      }
      
      if (isOrderedListMatch) {
        resultHtml += `<li>${isOrderedListMatch[2]}</li>`;
      } else {
        resultHtml += `<li>${line.substring(2)}</li>`;
      }
    } else {
      if (inList) {
        resultHtml += `</${inList}>`;
        inList = false;
      }
      
      if (line === '') {
        resultHtml += '<br />';
      } else if (line.startsWith('> ')) {
        resultHtml += `<blockquote class="border-l-4 border-accent/60 pl-4 py-1 my-3 bg-surface-secondary/50 text-text-secondary italic rounded-r">${line.substring(2)}</blockquote>`;
      } else if (line.startsWith('###### ')) {
        resultHtml += `<h6 class="text-[14px] font-bold text-accent mt-2 mb-1">${line.substring(7)}</h6>`;
      } else if (line.startsWith('##### ')) {
        resultHtml += `<h5 class="text-[15px] font-bold text-accent mt-2 mb-1">${line.substring(6)}</h5>`;
      } else if (line.startsWith('#### ')) {
        resultHtml += `<h4 class="text-[16px] font-bold text-accent mt-3 mb-1.5">${line.substring(5)}</h4>`;
      } else if (line.startsWith('### ')) {
        resultHtml += `<h3 class="text-[17px] font-bold text-accent mt-4 mb-2">${line.substring(4)}</h3>`;
      } else if (line.startsWith('## ')) {
        resultHtml += `<h2 class="text-[19px] font-bold text-accent mt-5 mb-2">${line.substring(3)}</h2>`;
      } else if (line.startsWith('# ')) {
        resultHtml += `<h1 class="text-[22px] font-bold text-accent mt-6 mb-3">${line.substring(2)}</h1>`;
      } else {
        resultHtml += `<span>${line}</span><br />`;
      }
    }
  }

  if (inList) {
    resultHtml += `</${inList}>`;
  }

  // Remove trailing <br /> if it exists
  if (resultHtml.endsWith('<br />')) {
    resultHtml = resultHtml.slice(0, -6);
  }

  // Replace placeholders with actual HTML — inline code first (harmless
  // either order, since the two placeholder formats can't overlap), then
  // code blocks.
  for (let i = 0; i < inlineCodes.length; i++) {
    resultHtml = resultHtml.replace(`@@NEXAINLINECODE${i}@@`, inlineCodes[i]);
  }
  for (let i = 0; i < codeBlocks.length; i++) {
    resultHtml = resultHtml.replace(`@@NEXACODEBLOCK${i}@@`, codeBlocks[i]);
  }

  return resultHtml;
}
