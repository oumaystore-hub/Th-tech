import rss from '@astrojs/rss';

// استيراد الملفات كنص خام
const allFiles = import.meta.glob('/src/pages/*/*.astro', { eager: true, query: '?raw' });

// دالة لاستخراج Frontmatter من النص
function parseFrontmatter(content) {
  // 1. التأكد من أن المحتوى نص حقيقي
  if (!content) return {};
  
  // البحث عن الكتلة بين --- و ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const data = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    const matchLine = line.match(/^(\w+):\s*(.*)/);
    if (matchLine) {
      let key = matchLine[1];
      let value = matchLine[2].trim();
      
      // إزالة علامات التنصيص إن وجدت
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      data[key] = value;
    }
  });
  return data;
}

export function GET(context) {
  const items = [];

  for (const path in allFiles) {
    // 2. إصلاح الخطأ: استخراج النص سواء كان نصاً مباشراً أو داخل كائن default
    const rawContent = typeof allFiles[path] === 'string' 
      ? allFiles[path] 
      : (allFiles[path]?.default || '');
      
    const fm = parseFrontmatter(rawContent);
    
    // تجاهل الصفحة الرئيسية و 404
    if (path.includes('pages/index.astro') || path.includes('404')) continue;

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
