import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'pages', 'tools');

const START_MARKER = '<!-- TH-RELATED-TOOLS-START -->';
const END_MARKER = '<!-- TH-RELATED-TOOLS-END -->';

/* ==========================================
   اكتشاف الأدوات
   ========================================== */

const toolDirs = fs
  .readdirSync(TOOLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) =>
    fs.existsSync(
      path.join(TOOLS_DIR, slug, 'index.astro')
    )
  );

/* ==========================================
   أدوات مساعدة
   ========================================== */

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

/* ==========================================
   مجموعات الكلمات
   ========================================== */

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
  code: ['code', 'formatter', 'format', 'كود']
};

const tools = toolDirs.map((slug) => ({
  slug,
  name: getToolName(slug),
  normalized: normalize(getToolName(slug))
}));

/* ==========================================
   حساب الأدوات المرتبطة
   ========================================== */

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

  const currentWords = new Set(
    current.split(/\s+/)
  );

  const candidateWords = new Set(
    candidate.split(/\s+/)
  );

  for (const word of currentWords) {
    if (
      word.length > 2 &&
      candidateWords.has(word)
    ) {
      score += 5;
    }
  }

  return score;
}

function getRelatedTools(currentTool, limit = 6) {
  return tools
    .map((tool) => ({
      ...tool,
      score: scoreTools(currentTool, tool)
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
   أيقونات SVG
   ========================================== */

function getToolIcon(slug) {
  const s = slug.toLowerCase();

  if (s.includes('json')) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4C6 5 5 7 5 10s1 5 3 6"/>
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
        <circle cx="15" cy="15" r="1.5"/>
      </svg>`;
  }

  if (
    s.includes('regex') ||
    s.includes('regexp')
  ) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3"/>
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
        <path d="M5 5h14M12 5v14M8 19h8M8 9h8"/>
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

/* ==========================================
   إنشاء القسم
   ========================================== */

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

          <span
            class="related-tool-arrow"
            aria-hidden="true"
          >
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

  <div class="related-tools-grid">
    ${cards}
  </div>
</section>

<style>
  /* =====================================
     الحاوية
     ===================================== */

  .related-tools {
    width: min(1000px, 100%);
    margin: 38px auto 24px;
    padding: 20px;

    border-radius: 18px;

    background: #ffffff;
    color: #0f172a;

    border: 1px solid #e2e8f0;

    box-shadow:
      0 6px 20px rgba(15, 23, 42, 0.06);

    transition:
      background .25s ease,
      color .25s ease,
      border-color .25s ease;
  }

  /* =====================================
     العنوان
     ===================================== */

  .related-tools-header {
    margin-bottom: 16px;
  }

  .related-tools-label {
    display: inline-block;

    margin-bottom: 4px;

    color: #0284c7;

    font-size: .76rem;
    font-weight: 800;
  }

  .related-tools h2 {
    margin: 0 0 4px;

    color: #0f172a;

    font-size: 1.25rem;
    line-height: 1.4;
    font-weight: 800;
  }

  .related-tools p {
    margin: 0;

    color: #64748b;

    font-size: .84rem;
  }

  /* =====================================
     البطاقات
     ===================================== */

  .related-tools-grid {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 10px;
  }

  .related-tool-card {
    display: flex;
    align-items: center;

    min-width: 0;
    min-height: 56px;

    gap: 9px;

    padding: 8px 10px;

    border-radius: 11px;

    background: #f8fafc;
    color: #0f172a;

    border: 1px solid #e2e8f0;

    text-decoration: none;

    box-shadow:
      0 2px 7px rgba(15, 23, 42, 0.035);

    transition:
      transform .18s ease,
      background .18s ease,
      border-color .18s ease;
  }

  .related-tool-card:hover {
    transform: translateY(-2px);

    background: #f0f9ff;

    color: #0f172a;

    border-color: #38bdf8;
  }

  /* =====================================
     الأيقونة
     ===================================== */

  .related-tool-icon {
    display: grid;
    place-items: center;

    width: 33px;
    height: 33px;

    flex: 0 0 33px;

    border-radius: 9px;

    color: #0284c7;

    background: #e0f2fe;
  }

  .related-tool-icon svg {
    width: 17px;
    height: 17px;

    fill: none;

    stroke: currentColor;

    stroke-width: 1.8;

    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* =====================================
     النص
     ===================================== */

  .related-tool-content {
    display: flex;
    flex-direction: column;

    gap: 2px;

    min-width: 0;
    flex: 1;
  }

  .related-tool-content strong {
    display: block;

    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: #0f172a;

    font-size: .82rem;
    line-height: 1.25;
    font-weight: 750;
  }

  .related-tool-content small {
    color: #64748b;

    font-size: .67rem;
    line-height: 1.2;
  }

  .related-tool-arrow {
    flex: 0 0 auto;

    color: #94a3b8;

    font-size: .8rem;

    transition:
      color .18s ease,
      transform .18s ease;
  }

  .related-tool-card:hover .related-tool-arrow {
    color: #0284c7;

    transform: translateX(-2px);
  }

  /* =====================================
     الوضع الليلي
     يعتمد على class الموجود في المشروع
     html.dark-mode
     ===================================== */

  html.dark-mode .related-tools {
    background: #111827;
    color: #f8fafc;

    border-color: rgba(255,255,255,.08);

    box-shadow:
      0 8px 25px rgba(0,0,0,.22);
  }

  html.dark-mode .related-tools h2 {
    color: #f8fafc;
  }

  html.dark-mode .related-tools p {
    color: #cbd5e1;
  }

  html.dark-mode .related-tool-card {
    background: #1e293b;
    color: #f8fafc;

    border-color: rgba(255,255,255,.08);

    box-shadow: none;
  }

  html.dark-mode .related-tool-card:hover {
    background: #263449;
    color: #ffffff;

    border-color: #38bdf8;
  }

  html.dark-mode .related-tool-icon {
    color: #38bdf8;

    background: rgba(56,189,248,.12);
  }

  html.dark-mode .related-tool-content strong {
    color: #f8fafc;
  }

  html.dark-mode .related-tool-content small {
    color: #94a3b8;
  }

  html.dark-mode .related-tool-arrow {
    color: #64748b;
  }

  html.dark-mode .related-tool-card:hover
  .related-tool-arrow {
    color: #38bdf8;
  }

  /* =====================================
     الهاتف
     ===================================== */

  @media (max-width: 800px) {

    .related-tools {
      padding: 17px;
      margin-top: 30px;
    }

    .related-tools-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {

    .related-tools {
      padding: 15px;
    }

    .related-tools-grid {
      grid-template-columns: 1fr;
    }

    .related-tool-card {
      min-height: 53px;
      padding: 8px;
    }

    .related-tool-icon {
      width: 31px;
      height: 31px;
      flex-basis: 31px;
    }

    .related-tool-icon svg {
      width: 16px;
      height: 16px;
    }
  }
</style>

${END_MARKER}`;
}

/* ==========================================
   حذف النسخة القديمة
   ========================================== */

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
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

/* ==========================================
   تحديث جميع الأدوات
   ========================================== */

for (const slug of toolDirs) {
  const filePath = path.join(
    TOOLS_DIR,
    slug,
    'index.astro'
  );

  let content = fs.readFileSync(
    filePath,
    'utf8'
  );

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
