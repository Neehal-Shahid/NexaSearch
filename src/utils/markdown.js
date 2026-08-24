export function parseMarkdown(text) {
  if (!text) return '';
  
  const codeBlocks = [];
  
  // 1. Extract code blocks and replace with placeholders
  let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const encodedCode = encodeURIComponent(code);
    codeBlocks.push(`
      <div class="my-5 bg-background border border-border-subtle rounded-xl overflow-hidden shadow-sm relative group">
        <div class="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-border-subtle">
          <span class="text-xs font-bold text-text-secondary uppercase tracking-wider">${lang || 'CODE'}</span>
          <button class="copy-code-btn text-xs font-medium text-text-muted hover:text-accent flex items-center gap-1.5 transition-colors focus:outline-none" data-code="${encodedCode}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span>Copy code</span>
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-[13.5px] leading-relaxed text-text-primary whitespace-pre font-mono"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    `);
    return placeholder;
  });

  // 2. Parse inline code: `code`
  processedText = processedText.replace(/`([^`]+)`/g, (match, p1) => {
    return `<code class="bg-surface-secondary border border-border-subtle px-1.5 py-0.5 rounded-md font-mono text-[13.5px] text-text-primary">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
  });

  // 3. Parse bold: **text** -> <strong>text</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-accent">$1</strong>');

  // 4. Parse lists, paragraphs, headings, and dividers
  const lines = processedText.split('\n');
  let resultHtml = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Code blocks
    if (line.match(/^__CODE_BLOCK_\d+__$/)) {
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

    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        resultHtml += '<ul class="list-disc ml-6 mt-2 mb-2 space-y-1">';
        inList = true;
      }
      resultHtml += `<li>${line.substring(2)}</li>`;
    } else {
      if (inList) {
        resultHtml += '</ul>';
        inList = false;
      }
      
      if (line === '') {
        resultHtml += '<br />';
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
    resultHtml += '</ul>';
  }

  // Remove trailing <br /> if it exists
  if (resultHtml.endsWith('<br />')) {
    resultHtml = resultHtml.slice(0, -6);
  }

  // 5. Replace placeholders with actual code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    resultHtml = resultHtml.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  return resultHtml;
}
