import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'pages', 'tools');

const START_MARKER = '<!-- TH-RELATED-TOOLS-START -->';
const END_MARKER = '<!-- TH-RELATED-TOOLS-END -->';

const toolDirs = fs
  .readdirSync(TOOLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) =>
    fs.existsSync(path.join(TOOLS_DIR, slug, 'index.astro'))
  );

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();

const getToolName = (slug) =>
  slug
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');

const keywords = {
  json: ['json', 'javascript object notation', 'بيانات json'],
  javascript: ['javascript', 'js', 'جافاسكريبت'],
  html: ['html', 'markup', 'صفحة ويب'],
  css: ['css', 'style', 'styles'],
  markdown: ['markdown', 'md'],
  text: [
    'text',
    'word',
    'character',
    'sentence',
    'نص',
    'كلمة',
    'حرف'
  ],
  image: ['image', 'photo', 'picture', 'صورة'],
  color: ['color', 'colour', 'hex', 'rgb', 'hsl', 'لون'],
  url: ['url', 'link', 'رابط'],
  qr: ['qr', 'qrcode', 'باركود'],
  barcode: ['barcode', 'باركود'],
  base64: ['base64', 'encode', 'decode'],
  hash: ['hash', 'md5', 'sha'],
  jwt: ['jwt', 'token'],
  uuid: ['uuid', 'guid'],
  regex: ['regex', 'regexp', 'regular expression'],
  timestamp: ['timestamp', 'date', 'time', 'تاريخ', 'وقت'],
  xml: ['xml'],
  yaml: ['yaml', 'yml'],
  csv: ['csv'],
  sql: ['sql', 'database', 'قاعدة بيانات'],
  api: ['api', 'request', 'http', 'rest', 'endpoint'],
  crypto: ['crypto', 'encryption', 'decrypt', 'encrypt', 'تشفير'],
  code: ['code', 'formatter', 'format', 'كود'],
};

const tools = toolDirs.map((slug) => ({
  slug,
  name: getToolName(slug),
  normalized: normalize(getToolName(slug)),
}));

function scoreTools(currentTool, candidateTool) {
  if (currentTool.slug === candidateTool.slug) {
    return -Infinity;
  }

  const current = currentTool.normalized;
  const candidate = candidateTool.normalized;

  let score = 0;

  for (const words of Object.values(keywords)) {
    const currentHasGroup = words.some((word) =>
      current.includes(normalize(word))
    );

    const candidateHasGroup = words.some((word) =>
      candidate.includes(normalize(word))
    );

    if (currentHasGroup && candidateHasGroup) {
      score += 10;
    }
  }

  const currentWords = new Set(current.split(/\s+/));
  const candidateWords = new Set(candidate.split(/\s+/));

  for (const word of currentWords) {
    if (word.length > 2 && candidateWords.has(word)) {
      score += 5;
    }
  }

  return score;
}

function getRelatedTools(currentTool, limit = 6) {
  return tools
    .map((tool) => ({
      ...tool,
      score: scoreTools(currentTool, tool),
    }))
    .filter((tool) => tool.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);
}

function buildRelatedToolsBlock(relatedTools) {
  if (!relatedTools.length) {
    return '';
  }

  const cards = relatedTools
    .map(
      (tool) => `
        <a
          class="related-tool-card"
          href={\`\${base}/tools/${tool.slug}/\`}
        >
          <span class="related-tool-icon">⚡</span>

          <span class="related-tool-content">
            <strong>${tool.name}</strong>
            <small>أداة مرتبطة</small>
          </span>
        </a>`
    )
    .join('');

  return `${START_MARKER}
<section
  class="related-tools"
  aria-labelledby="related-tools-title"
>
  <div class="related-tools-header">
    <div>
      <span class="related-tools-label">
        استكشف المزيد
      </span>

      <h2 id="related-tools-title">
        أدوات ذات صلة
      </h2>

      <p>
        أدوات أخرى قد تساعدك في إكمال مهمتك.
      </p>
    </div>
  </div>

  <div class="related-tools-grid">
    ${cards}
  </div>
</section>

<style>
  /* ================================
     Related Tools
     الوضع الافتراضي: فاتح
     ================================ */

  .related-tools {
    width: min(1100px, 100%);
    margin: 50px auto 30px;
    padding: 28px;
    border-radius: 20px;

    background: #ffffff;
    color: #0f172a;

    border: 1px solid rgba(15, 23, 42, 0.10);

    box-shadow:
      0 10px 30px rgba(15, 23, 42, 0.06);

    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .related-tools-header {
    margin-bottom: 22px;
  }

  .related-tools-label {
    display: inline-block;
    margin-bottom: 7px;

    color: #0284c7;

    font-size: 0.85rem;
    font-weight: 700;
  }

  .related-tools h2 {
    margin: 0 0 8px;

    color: #0f172a;

    font-size: 1.55rem;
    font-weight: 800;
  }

  .related-tools p {
    margin: 0;

    color: #64748b;

    font-size: 0.95rem;
  }

  .related-tools-grid {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 14px;
  }

  .related-tool-card {
    display: flex;
    align-items: center;

    gap: 12px;

    min-height: 72px;

    padding: 14px;

    border-radius: 15px;

    text-decoration: none;

    color: #0f172a;

    background: #f8fafc;

    border: 1px solid rgba(15, 23, 42, 0.08);

    box-shadow:
      0 4px 12px rgba(15, 23, 42, 0.04);

    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .related-tool-card:hover {
    transform: translateY(-3px);

    color: #0f172a;

    border-color: #38bdf8;

    background: #f0f9ff;

    box-shadow:
      0 8px 20px rgba(14, 165, 233, 0.10);
  }

  .related-tool-icon {
    display: grid;
    place-items: center;

    width: 42px;
    height: 42px;

    flex: 0 0 42px;

    border-radius: 12px;

    color: #0284c7;

    background: rgba(14, 165, 233, 0.12);

    font-size: 1.1rem;
  }

  .related-tool-content {
    display: flex;
    flex-direction: column;

    gap: 4px;

    min-width: 0;
  }

  .related-tool-content strong {
    color: #0f172a;

    font-size: 0.95rem;
    font-weight: 700;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .related-tool-content small {
    color: #64748b;

    font-size: 0.75rem;
  }


  /* ================================
     الوضع الداكن
     ================================ */

  [data-theme="dark"] .related-tools,
  html[data-theme="dark"] .related-tools,
  body[data-theme="dark"] .related-tools {
    background: #111827;
    color: #f8fafc;

    border-color: rgba(255, 255, 255, 0.08);

    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.20);
  }

  [data-theme="dark"] .related-tools h2,
  html[data-theme="dark"] .related-tools h2,
  body[data-theme="dark"] .related-tools h2 {
    color: #f8fafc;
  }

  [data-theme="dark"] .related-tools p,
  html[data-theme="dark"] .related-tools p,
  body[data-theme="dark"] .related-tools p {
    color: #cbd5e1;
  }

  [data-theme="dark"] .related-tool-card,
  html[data-theme="dark"] .related-tool-card,
  body[data-theme="dark"] .related-tool-card {
    color: #f8fafc;

    background: rgba(255, 255, 255, 0.035);

    border-color: rgba(255, 255, 255, 0.08);

    box-shadow: none;
  }

  [data-theme="dark"] .related-tool-card:hover,
  html[data-theme="dark"] .related-tool-card:hover,
  body[data-theme="dark"] .related-tool-card:hover {
    color: #ffffff;

    border-color: #38bdf8;

    background: rgba(56, 189, 248, 0.08);
  }

  [data-theme="dark"] .related-tool-content strong,
  html[data-theme="dark"] .related-tool-content strong,
  body[data-theme="dark"] .related-tool-content strong {
    color: #f8fafc;
  }

  [data-theme="dark"] .related-tool-content small,
  html[data-theme="dark"] .related-tool-content small,
  body[data-theme="dark"] .related-tool-content small {
    color: #94a3b8;
  }

  [data-theme="dark"] .related-tool-icon,
  html[data-theme="dark"] .related-tool-icon,
  body[data-theme="dark"] .related-tool-icon {
    color: #38bdf8;

    background: rgba(56, 189, 248, 0.12);
  }


  /* ================================
     الوضع الفاتح — أولوية قصوى
     ================================ */

  [data-theme="light"] .related-tools,
  html[data-theme="light"] .related-tools,
  body[data-theme="light"] .related-tools {
    background: #ffffff !important;

    color: #0f172a !important;

    border-color: rgba(15, 23, 42, 0.10) !important;

    box-shadow:
      0 10px 30px rgba(15, 23, 42, 0.06) !important;
  }

  [data-theme="light"] .related-tools h2,
  html[data-theme="light"] .related-tools h2,
  body[data-theme="light"] .related-tools h2 {
    color: #0f172a !important;
  }

  [data-theme="light"] .related-tools p,
  html[data-theme="light"] .related-tools p,
  body[data-theme="light"] .related-tools p {
    color: #64748b !important;
  }

  [data-theme="light"] .related-tool-card,
  html[data-theme="light"] .related-tool-card,
  body[data-theme="light"] .related-tool-card {
    color: #0f172a !important;

    background: #f8fafc !important;

    border-color: rgba(15, 23, 42, 0.08) !important;

    box-shadow:
      0 4px 12px rgba(15, 23, 42, 0.04) !important;
  }

  [data-theme="light"] .related-tool-card:hover,
  html[data-theme="light"] .related-tool-card:hover,
  body[data-theme="light"] .related-tool-card:hover {
    color: #0f172a !important;

    background: #f0f9ff !important;

    border-color: #38bdf8 !important;
  }

  [data-theme="light"] .related-tool-content strong,
  html[data-theme="light"] .related-tool-content strong,
  body[data-theme="light"] .related-tool-content strong {
    color: #0f172a !important;
  }

  [data-theme="light"] .related-tool-content small,
  html[data-theme="light"] .related-tool-content small {
    color: #64748b !important;
  }

  [data-theme="light"] .related-tool-icon,
  html[data-theme="light"] .related-tool-icon,
  body[data-theme="light"] .related-tool-icon {
    color: #0284c7 !important;

    background: rgba(14, 165, 233, 0.12) !important;
  }


  /* ================================
     Responsive
     ================================ */

  @media (max-width: 800px) {
    .related-tools {
      padding: 20px;
      margin-top: 35px;
    }

    .related-tools-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .related-tools-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
${END_MARKER}`;
}

function removeOldRelatedBlock(content) {
  const markedRegex = new RegExp(
    `${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(
      END_MARKER
    )}\\s*`,
    'g'
  );

  content = content.replace(markedRegex, '');

  const oldRegex =
    /\s*<section class="related-tools"[\s\S]*?<\/style>\s*/g;

  content = content.replace(oldRegex, '\n');

  return content;
}

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

for (const slug of toolDirs) {
  const filePath = path.join(
    TOOLS_DIR,
    slug,
    'index.astro'
  );

  let content = fs.readFileSync(filePath, 'utf8');

  const currentTool = tools.find(
    (tool) => tool.slug === slug
  );

  if (!currentTool) {
    continue;
  }

  content = removeOldRelatedBlock(content);

  const relatedTools = getRelatedTools(
    currentTool,
    6
  );

  if (!relatedTools.length) {
    fs.writeFileSync(
      filePath,
      content,
      'utf8'
    );

    console.log(
      `⚠️ لا توجد أدوات مرتبطة: ${slug}`
    );

    continue;
  }

  const block =
    buildRelatedToolsBlock(relatedTools);

  const mainEnd = content.lastIndexOf('</main>');

  if (mainEnd === -1) {
    console.log(
      `❌ لم يتم العثور على </main>: ${slug}`
    );
    continue;
  }

  content =
    content.slice(0, mainEnd) +
    '\n\n' +
    block +
    '\n\n' +
    content.slice(mainEnd);

  fs.writeFileSync(
    filePath,
    content,
    'utf8'
  );

  console.log(
    `✅ ${slug} ← ${relatedTools
      .map((tool) => tool.slug)
      .join(', ')}`
  );
}

console.log(
  '\n🎉 تم تحديث الربط الداخلي لجميع الأدوات بنجاح.'
);
