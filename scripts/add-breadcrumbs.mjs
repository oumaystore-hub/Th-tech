import fs from "fs";
import path from "path";

const toolsDir = path.join(process.cwd(), "src/pages/tools");

const START = "<!-- TH-BREADCRUMBS-START -->";
const END = "<!-- TH-BREADCRUMBS-END -->";

const categoryNames = {
  json: "JSON",
  text: "النصوص",
  code: "البرمجة",
  security: "الأمان",
  color: "الألوان",
  image: "الصور",
  api: "API",
  crypto: "التشفير",
  web: "الويب",
  other: "أدوات تقنية"
};

const categorySlugs = {
  json: "json",
  text: "text",
  code: "programming",
  security: "security",
  color: "color",
  image: "image",
  api: "api",
  crypto: "security",
  web: "web",
  other: "tools"
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getCategory(slug) {
  const s = normalize(slug);

  if (
    s.includes("json")
  ) {
    return "json";
  }

  if (
    s.includes("word") ||
    s.includes("line") ||
    s.includes("character") ||
    s.includes("text") ||
    s.includes("counter") ||
    s.includes("case") ||
    s.includes("lorem") ||
    s.includes("slug")
  ) {
    return "text";
  }

  if (
    s.includes("javascript") ||
    s.includes("js-") ||
    s.includes("-js") ||
    s.includes("html") ||
    s.includes("css") ||
    s.includes("markdown") ||
    s.includes("xml") ||
    s.includes("yaml") ||
    s.includes("sql") ||
    s.includes("code") ||
    s.includes("regex")
  ) {
    return "code";
  }

  if (
    s.includes("jwt") ||
    s.includes("password") ||
    s.includes("security") ||
    s.includes("hash") ||
    s.includes("base64") ||
    s.includes("encrypt") ||
    s.includes("decrypt") ||
    s.includes("uuid")
  ) {
    return "security";
  }

  if (
    s.includes("color") ||
    s.includes("hex") ||
    s.includes("rgb") ||
    s.includes("hsl")
  ) {
    return "color";
  }

  if (
    s.includes("qr") ||
    s.includes("barcode") ||
    s.includes("image") ||
    s.includes("png") ||
    s.includes("jpg") ||
    s.includes("jpeg")
  ) {
    return "image";
  }

  if (
    s.includes("api") ||
    s.includes("request") ||
    s.includes("http") ||
    s.includes("curl")
  ) {
    return "api";
  }

  if (
    s.includes("timestamp") ||
    s.includes("date") ||
    s.includes("time")
  ) {
    return "web";
  }

  return "other";
}

function getToolName(content, slug) {
  const titleMatch = content.match(
    /const\s+title\s*=\s*["'`](.*?)["'`]/
  );

  if (titleMatch && titleMatch[1]) {
    return titleMatch[1]
      .replace(/\s*\|.*$/, "")
      .replace(/\s*-\s*Th\.Tech.*$/i, "")
      .trim();
  }

  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getToolFiles(dir) {
  const results = [];

  if (!fs.existsSync(dir)) return results;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      results.push(...getToolFiles(fullPath));
      continue;
    }

    if (item.name === "index.astro") {
      results.push(fullPath);
    }
  }

  return results;
}

function buildBreadcrumbs(slug, toolName, category) {
  const base = "https://oumaystore-hub.github.io/Th-tech";

  const categoryName =
    categoryNames[category] || categoryNames.other;

  const categorySlug =
    categorySlugs[category] || categorySlugs.other;

  return `
${START}
<nav class="tool-breadcrumbs" aria-label="مسار التنقل">
  <a href="${base}/">الرئيسية</a>
  <span aria-hidden="true">←</span>

  <a href="${base}/tools/">الأدوات</a>
  <span aria-hidden="true">←</span>

  <a href="${base}/tools/?category=${categorySlug}">
    ${categoryName}
  </a>

  <span aria-hidden="true">←</span>

  <span aria-current="page">${toolName}</span>
</nav>

<style>
.tool-breadcrumbs {
  width: min(100% - 32px, 1000px);
  margin: 0 auto 18px;
  padding: 10px 14px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;

  font-size: 13px;
  line-height: 1.7;

  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;

  box-sizing: border-box;
}

.tool-breadcrumbs a {
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease;
}

.tool-breadcrumbs a:hover {
  text-decoration: underline;
}

.tool-breadcrumbs span[aria-hidden="true"] {
  color: #94a3b8;
}

.tool-breadcrumbs span[aria-current="page"] {
  color: #334155;
  font-weight: 600;
}

html.dark-mode .tool-breadcrumbs {
  color: #94a3b8;
  background: #111827;
  border-color: #263449;
}

html.dark-mode .tool-breadcrumbs a {
  color: #60a5fa;
}

html.dark-mode .tool-breadcrumbs span[aria-hidden="true"] {
  color: #64748b;
}

html.dark-mode .tool-breadcrumbs span[aria-current="page"] {
  color: #e2e8f0;
}

@media (max-width: 520px) {
  .tool-breadcrumbs {
    width: calc(100% - 20px);
    margin-bottom: 14px;
    padding: 8px 10px;
    font-size: 12px;
    gap: 5px;
  }
}
</style>
${END}
`;
}

const files = getToolFiles(toolsDir);

let updated = 0;
let skipped = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");

  const slug = path.basename(path.dirname(file));

  // لا نضيف Breadcrumbs لصفحة /tools/ نفسها
  if (!slug || slug === "tools") {
    skipped++;
    continue;
  }

  const category = getCategory(slug);
  const toolName = getToolName(content, slug);
  const breadcrumbs = buildBreadcrumbs(
    slug,
    toolName,
    category
  );

  // حذف النسخة السابقة إن وجدت
  const blockRegex = new RegExp(
    `${START}[\\s\\S]*?${END}`,
    "g"
  );

  content = content.replace(blockRegex, "");

  // نبحث عن بداية main
  const mainMatch = content.match(/<main\b[^>]*>/i);

  if (!mainMatch) {
    console.log(`⚠️ لم يتم العثور على <main>: ${slug}`);
    skipped++;
    continue;
  }

  const insertPosition =
    mainMatch.index + mainMatch[0].length;

  content =
    content.slice(0, insertPosition) +
    breadcrumbs +
    content.slice(insertPosition);

  fs.writeFileSync(file, content, "utf8");

  updated++;
  console.log(`✓ ${slug}`);
}

console.log("");
console.log("================================");
console.log(`تم تحديث الأدوات: ${updated}`);
console.log(`تم تجاوز: ${skipped}`);
console.log("Breadcrumbs تمت إضافتها تلقائيًا.");
console.log("================================");
