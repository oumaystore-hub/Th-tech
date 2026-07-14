import rss from '@astrojs/rss';

// هذا السطر يبحث عن جميع ملفات الماركداون في مجلد الصفحات
const pages = import.meta.glob('/src/pages/**/*.md', { eager: true });

export function GET(context) {
  const items = [];

  for (const path in pages) {
    const page = pages[path];
    
    // تنظيف الرابط لاستخراج المسار الصحيح (Slug)
    // يحول /src/pages/ai/post.md إلى ai/post/
    let slug = path.replace('/src/pages/', '').replace('/index.md', '/').replace('.md', '/');
    
    // التأكد من أن الصفحة تحتوي على بيانات (Frontmatter)
    if (page.frontmatter && page.frontmatter.title) {
      items.push({
        title: page.frontmatter.title,
        pubDate: page.frontmatter.pubDate || new Date(), // يستخدم تاريخ اليوم إذا لم يوجد
        description: page.frontmatter.description || '',
        link: slug,
      });
    }
  }

  // ترتيب المقالات من الأحدث إلى الأقدم
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return rss({
    title: 'Th.Tech - المدونة التقنية',
    description: 'أحدث المقالات والشروحات في الذكاء الاصطناعي والبرمجة',
    site: context.site, // يأخذ الرابط الأساسي من astro.config.mjs
    items: items,
    customData: `<language>ar-SA</language>`,
  });
}
