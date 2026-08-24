export function parseMarkdown(text) {
  if (!text) return '';

  // 1. Parse bold: **text** -> <strong>text</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-accent">$1</strong>');

  // 2. Parse lists and paragraphs
  const lines = html.split('\n');
  let resultHtml = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('* ')) {
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

  return resultHtml;
}
