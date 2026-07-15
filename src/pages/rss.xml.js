import rss from '@astrojs/rss';

// 1. استيراد الملفات كنص خام (Raw Text) لاستخراج البيانات يدوياً
const allFiles = import.meta.glob('/src/pages/*/*.astro', { eager: true, query: '?raw' });

// دالة لاستخراج Frontmatter من النص
function parseFrontmatter(content) {
  // البحث عن الكتلة بين --- و ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const data = {};
  const lines = match[1].split('\n');
  
  lines.forEach(line => {
    // استخراج المفتاح والقيمة (مثل title: "العنوان")
    const matchLine = line.match(/^(\w+):\s*(.*)/);
    if (matchLine) {
      let key = matchLine[1];
      let value = matchLine[2].trim();
      
      // إزالة علامات التنصيص إذا وجدت ("...")
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // إزالة علامات التنصيص المفردة إذا وجدت ('...')
      else if (value.startsWith("'") && value.endsWith("'")) {
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
    const content = allFiles[path]; // المحتوى النصي للملف
    const fm = parseFrontmatter(content); // استخراج البيانات
    
    // تجاهل الصفحة الرئيسية وصفحة 404
    if (path.includes('pages/index.astro') || path.includes('404')) continue;

    // إذا كان هناك عنوان، أضفه للقائمة
    if (fm.title) {
      // تحويل المسار (مثال: /src/pages/ai/index.astro -> ai/)
      let slug = path.replace('/src/pages/', '').replace('/index.astro', '/');
      
      items.push({
        title: fm.title,
        pubDate: fm.pubDate ? new Date(fm.pubDate) : new Date(), // تحويل التاريخ
        description: fm.description || '',
        link: slug,
      });
    }
  }

  // ترتيب المقالات من الأحدث للأقدم
  items.sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'Th.Tech - المدونة التقنية',
    description: 'أحدث المقالات والشروحات في الذكاء الاصطناعي والبرمجة',
    site: context.site,
    items: items,
    customData: `<language>ar-SA</language>`,
  });
}
