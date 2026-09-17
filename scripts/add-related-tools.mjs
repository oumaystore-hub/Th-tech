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

/* ==========================================
   أيقونات SVG حسب نوع الأداة
   ========================================== */

function getToolIcon(slug) {
  const s = slug.toLowerCase();

  if (s.includes('json')) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4c-2 1-3 3-3 6s1 5 3 6"/>
        <path d="M16 4c2 1 3 3 3 6s-1 5-3 6"/>
        <path d="M9 8h6M9 12h4M9 16h6"/>
      </svg>`;
  }

  if (
    s.includes('javascript') ||
    s.includes('js')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M8 9v7l2 2 2-2M15 9v7"/>
      </svg>`;
  }

  if (s.includes('html')) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 5-5 7 5 7M17 5l5 7-5 7M14 3l-4 18"/>
      </svg>`;
  }

  if (s.includes('css')) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 3 1.5 17L12 21l4.5-1L18 3Z"/>
        <path d="M8 7h8M8.5 11h7M9 15h6"/>
      </svg>`;
  }

  if (
    s.includes('markdown') ||
    s.includes('md')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="M6 15V9l3 3 3-3v6M16 9v6M14 13l2 2 2-2"/>
      </svg>`;
  }

  if (
    s.includes('image') ||
    s.includes('photo') ||
    s.includes('compress')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <circle cx="8" cy="9" r="1.5"/>
        <path d="m5 17 5-5 3 3 2-2 4 4"/>
      </svg>`;
  }

  if (
    s.includes('qr') ||
    s.includes('barcode')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6"/>
        <rect x="14" y="4" width="6" height="6"/>
        <rect x="4" y="14" width="6" height="6"/>
        <path d="M14 14h3v3h-3zM20 14v6M14 20h3"/>
      </svg>`;
  }

  if (
    s.includes('url') ||
    s.includes('link')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/>
        <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>
      </svg>`;
  }

  if (
    s.includes('api') ||
    s.includes('request') ||
    s.includes('http')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="6" r="2"/>
        <circle cx="18" cy="6" r="2"/>
        <circle cx="18" cy="18" r="2"/>
        <path d="M8 6h6a4 4 0 0 1 4 4v6M6 8v8"/>
      </svg>`;
  }

  if (
    s.includes('jwt') ||
    s.includes('token') ||
    s.includes('auth')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>`;
  }

  if (
    s.includes('hash') ||
    s.includes('crypto') ||
    s.includes('encrypt')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 3 6 21M18 3l-2 18M3 9h18M2 15h18"/>
      </svg>`;
  }

  if (
    s.includes('color') ||
    s.includes('hex') ||
    s.includes('rgb')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8"/>
        <circle cx="9" cy="9" r="1.5"/>
        <circle cx="15" cy="9" r="1.5"/>
        <circle cx="9" cy="15" r="1.5"/>
        <path d="M14 15h.01"/>
      </svg>`;
  }

  if (
    s.includes('regex') ||
    s.includes('regexp')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14v14H5z"/>
        <path d="m8 12 2-2 2 2 2-2 2 2"/>
      </svg>`;
  }

  if (
    s.includes('sql') ||
    s.includes('database')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3"/>
        <path d="M5 5v7c0 2 3 3 7 3s7-1 7-3V5"/>
        <path d="M5 12v7c0 2 3 3 7 3s7-1 7-3v-7"/>
      </svg>`;
  }

  if (
    s.includes('xml') ||
    s.includes('yaml') ||
    s.includes('csv')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h8l4 4v14H6z"/>
        <path d="M14 3v5h5M9 12h6M9 16h6"/>
      </svg>`;
  }

  if (
    s.includes('date') ||
    s.includes('time') ||
    s.includes('timestamp')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 7v5l3 2"/>
      </svg>`;
  }

  if (
    s.includes('text') ||
    s.includes('word') ||
    s.includes('character') ||
    s.includes('counter')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14M12 5v14M8 19h8"/>
        <path d="M8 9h8"/>
      </svg>`;
  }

  if (
    s.includes('uuid') ||
    s.includes('guid')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3"/>
        <path d="M8 9h8M8 13h5M8 17h8"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h14v16H5z"/>
      <path d="M8 8h8M8 12h8M8 16h5"/>
    </svg>`;
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
          <span class="related-tool-icon">
            ${getToolIcon(tool.slug)}
          </span>

          <span class="related-tool-content">
            <strong>${tool.name}</strong>
            <small>أداة مرتبطة</small>
          </span>

          <span class="related-tool-arrow" aria-hidden="true">
            ←
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
  /* =========================================
     Related Tools
     الوضع الافتراضي = فاتح
     ========================================= */

  .related-tools {
    width: min(1000px, 100%);
    margin: 40px auto 25px;
    padding: 22px;

    border-radius: 18px;

    background: #ffffff !important;
    color: #0f172a !important;

    border: 1px solid #e2e8f0 !important;

    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.06) !important;

    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease;
  }

  .related-tools-header {
    margin-bottom: 17px;
  }

  .related-tools-label {
    display: inline-block;

    margin-bottom: 5px;

    color: #0284c7 !important;

    font-size: 0.78rem;
    font-weight: 800;
  }

  .related-tools h2 {
    margin: 0 0 5px;

    color: #0f172a !important;

    font-size: 1.3rem;
    line-height: 1.4;
    font-weight: 800;
  }

  .related-tools p {
    margin: 0;

    color: #64748b !important;

    font-size: 0.85rem;
  }

  /* =========================================
     Cards
     ========================================= */

  .related-tools-grid {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 10px;
  }

  .related-tool-card {
    display: flex;
    align-items: center;

    gap: 9px;

    min-height: 58px;

    padding: 9px 10px;

    border-radius: 12px;

    text-decoration: none !important;

    color: #0f172a !important;

    background: #f8fafc !important;

    border: 1px solid #e2e8f0 !important;

    box-shadow:
      0 2px 8px rgba(15, 23, 42, 0.035) !important;

    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease;
  }

  .related-tool-card:hover {
    transform: translateY(-2px);

    color: #0f172a !important;

    background: #f0f9ff !important;

    border-color: #38bdf8 !important;

    box-shadow:
      0 6px 14px rgba(14, 165, 233, 0.10) !important;
  }

  /* =========================================
     SVG icon
     ========================================= */

  .related-tool-icon {
    display: grid;
    place-items: center;

    width: 34px;
    height: 34px;

    flex: 0 0 34px;

    border-radius: 9px;

    color: #0284c7 !important;

    background: rgba(14, 165, 233, 0.10) !important;
  }

  .related-tool-icon svg {
    width: 18px;
    height: 18px;

    fill: none;
    stroke: currentColor;

    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .related-tool-content {
    display: flex;
    flex-direction: column;

    justify-content: center;

    gap: 2px;

    min-width: 0;
    flex: 1;
  }

  .related-tool-content strong {
    display: block;

    color: #0f172a !important;

    font-size: 0.84rem;
    line-height: 1.25;
    font-weight: 750;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .related-tool-content small {
    color: #64748b !important;

    font-size: 0.68rem;
    line-height: 1.2;
  }

  .related-tool-arrow {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;
    height: 22px;

    flex: 0 0 22px;

    color: #94a3b8 !important;

    font-size: 0.85rem;

    transition:
      transform 0.18s ease,
      color 0.18s ease;
  }

  .related-tool-card:hover .related-tool-arrow {
    color: #0284c7 !important;

    transform: translateX(-2px);
  }

  /* =========================================
     الوضع الليلي الحقيقي في المشروع
     يعتمد على class وليس data-theme
     ========================================= */

  html.dark-mode .related-tools,
  body.dark-mode .related-tools,
  html.dark .related-tools,
  body.dark .related-tools {
    background: #111827 !important;
    color: #f8fafc !important;

    border-color: rgba(255, 255, 255, 0.08) !important;

    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.20) !important;
  }

  html.dark-mode .related-tools h2,
  body.dark-mode .related-tools h2,
  html.dark .related-tools h2,
  body.dark .related-tools h2 {
    color: #f8fafc !important;
  }

  html.dark-mode .related-tools p,
  body.dark-mode .related-tools p,
  html.dark .related-tools p,
  body.dark .related-tools p {
    color: #cbd5e1 !important;
  }

  html.dark-mode .related-tool-card,
  body.dark-mode .related-tool-card,
  html.dark .related-tool-card,
  body.dark .related-tool-card {
    color: #f8fafc !important;

    background: #1e293b !important;

    border-color: rgba(255, 255, 255, 0.08) !important;

    box-shadow: none !important;
  }

  html.dark-mode .related-tool-card:hover,
  body.dark-mode .related-tool-card:hover,
  html.dark .related-tool-card:hover,
  body.dark .related-tool-card:hover {
    color: #ffffff !important;

    background: #263449 !important;

    border-color: #38bdf8 !important;
  }

  html.dark-mode .related-tool-content strong,
  body.dark-mode .related-tool-content strong,
  html.dark .related-tool-content strong,
  body.dark .related-tool-content strong {
    color: #f8fafc !important;
  }

  html.dark-mode .related-tool-content small,
  body.dark-mode .related-tool-content small,
  html.dark .related-tool-content small,
  body.dark .related-tool-content small {
    color: #94a3b8 !important;
  }

  html.dark-mode .related-tool-icon,
  body.dark-mode .related-tool-icon,
  html.dark .related-tool-icon,
  body.dark .related-tool-icon {
    color: #38bdf8 !important;

    background: rgba(56, 189, 248, 0.12) !important;
  }

  html.dark-mode .related-tool-arrow,
  body.dark-mode .related-tool-arrow,
  html.dark .related-tool-arrow,
  body.dark .related-tool-arrow {
    color: #64748b !important;
  }

  /* =========================================
     الوضع النهاري
     نتأكد أنه يتغلب على أي CSS عام
     ========================================= */

  html:not(.dark-mode) .related-tools,
  body:not(.dark-mode) .related-tools,
  html:not(.dark) .related-tools {
    background: #ffffff !important;

    color: #0f172a !important;

    border-color: #e2e8f0 !important;

    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.06) !important;
  }

  html:not(.dark-mode) .related-tool-card,
  body:not(.dark-mode) .related-tool-card,
  html:not(.dark) .related-tool-card {
    background: #f8fafc !important;

    color: #0f172a !important;

    border-color: #e2e8f0 !important;

    box-shadow:
      0 2px 8px rgba(15, 23, 42, 0.035) !important;
  }

  html:not(.dark-mode) .related-tool-content strong,
  body:not(.dark-mode) .related-tool-content strong,
  html:not(.dark) .related-tool-content strong {
    color: #0f172a !important;
  }

  html:not(.dark-mode) .related-tool-content small,
  body:not(.dark-mode) .related-tool-content small,
  html:not(.dark) .related-tool-content small {
    color: #64748b !important;
  }

  /* =========================================
     Responsive
     ========================================= */

  @media (max-width: 800px) {
    .related-tools {
      padding: 18px;
      margin-top: 30px;
    }

    .related-tools-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .related-tools {
      padding: 16px;
    }

    .related-tools-grid {
      grid-template-columns: 1fr;
    }

    .related-tool-card {
      min-height: 54px;
      padding: 8px 9px;
    }

    .related-tool-icon {
      width: 32px;
      height: 32px;
      flex-basis: 32px;
    }

    .related-tool-icon svg {
      width: 17px;
      height: 17px;
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
