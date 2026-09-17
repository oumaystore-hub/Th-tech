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
  .related-tools {
    width: min(1100px, 100%);
    margin: 50px auto 30px;
    padding: 28px;
    border-radius: 20px;
    background: var(--card-bg, #111827);
    border: 1px solid var(
      --border-color,
      rgba(255, 255, 255, 0.08)
    );
  }

  .related-tools-header {
    margin-bottom: 22px;
  }

  .related-tools-label {
    display: inline-block;
    margin-bottom: 7px;
    color: #38bdf8;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .related-tools h2 {
    margin: 0 0 8px;
    font-size: 1.55rem;
  }

  .related-tools p {
    margin: 0;
    opacity: 0.72;
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
    color: inherit;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .related-tool-card:hover {
    transform: translateY(-3px);
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
  }

  .related-tool-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 12px;
    background: rgba(56, 189, 248, 0.12);
    font-size: 1.1rem;
  }

  .related-tool-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .related-tool-content strong {
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .related-tool-content small {
    opacity: 0.55;
    font-size: 0.75rem;
  }

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

  [data-theme="light"] .related-tools {
    background: #ffffff;
    border-color: rgba(15, 23, 42, 0.1);
  }

  [data-theme="light"] .related-tool-card {
    background: #f8fafc;
    border-color: rgba(15, 23, 42, 0.08);
  }

  [data-theme="light"] .related-tool-card:hover {
    background: #f0f9ff;
  }
</style>
${END_MARKER}`;
}

function removeOldRelatedBlock(content) {
  // إزالة النسخة الجديدة إن كانت موجودة
  const markedRegex = new RegExp(
    `${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(
      END_MARKER
    )}\\s*`,
    'g'
  );

  content = content.replace(markedRegex, '');

  // إزالة النسخة القديمة التي أضافها السكربت السابق
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

  // إزالة أي نسخة سابقة أولاً
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

  // يجب أن يكون القسم داخل <main>
  const mainEnd = content.lastIndexOf('</main>');

  if (mainEnd === -1) {
    console.log(
      `❌ لم يتم العثور على </main>: ${slug}`
    );
    continue;
  }

  // إدراج القسم مباشرة قبل </main>
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
