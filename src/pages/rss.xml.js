import rss from '@astrojs/rss';

// استيراد الملفات كنص خام
const allFiles = import.meta.glob('/src/pages/*/*.astro', { eager: true, query: '?raw' });

// دالة ذكية تستخرج البيانات سواء كانت YAML أو JavaScript (const/export const)
function parseFrontmatter(content) {
  if (!content) return {};
  
  // البحث عن الكتلة البرمجية بين --- و ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const data = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    // 1. محاولة البحث عن تنسيق JS: const title = "..." أو export const title = "..."
    const jsMatch = line.match(/(?:export\s+)?const\s+(\w+)\s*=\s*["'](.*)["'];?/);
    if (jsMatch) {
      data[jsMatch[1]] = jsMatch[2];
      return;
    }

    // 2. محاولة البحث عن تنسيق YAML القديم: title: "..."
    const yamlMatch = line.match(/^(\w+):\s*(.*)/);
    if (yamlMatch) {
      let value = yamlMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      data[yamlMatch[1]] = value;
    }
  });
  
  return data;
}

export function GET(context) {
  const items = [];

  for (const path in allFiles) {
    const rawContent = typeof allFiles[path] === 'string' 
      ? allFiles[path] 
      : (allFiles[path]?.default || '');
      
    const fm = parseFrontmatter(rawContent);
    
    // تجاهل الصفحة الرئيسية و 404
    if (path.includes('pages/index.astro') || path.includes('404')) continue;

    // إذا وجدنا عنواناً، نضيفه للقائمة
    if (fm.title) {
      let slug = path.replace('/src/pages/', '').replace('/index.astro', '/');
      
      items.push({
        title: fm.title,
        pubDate: fm.pubDate ? new Date(fm.pubDate) : new Date(),
        description: fm.description || '',
        link: slug,
      });
    }
  }

  // الترتيب من الأحدث للأقدم
  items.sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'Th.Tech - المدونة التقنية',
    description: 'أحدث المقالات والشروحات في الذكاء الاصطناعي والبرمجة',
    site: context.site,
    items: items,
    customData: `<language>ar-SA</language>`,
  });
}
