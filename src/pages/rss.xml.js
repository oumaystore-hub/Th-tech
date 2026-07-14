import rss from '@astrojs/rss';

// البحث عن ملفات index.astro في المجلدات
const pages = import.meta.glob('/src/pages/*/index.astro', { eager: true });

export function GET(context) {
  const items = [];

  for (const path in pages) {
    const page = pages[path];
    
    // تجاهل الصفحات الرئيسية و 404
    if (path.includes('index.astro') && !path.includes('pages/index.astro') && !path.includes('404')) {
      if (page.frontmatter && page.frontmatter.title) {
        const slug = path.replace('/src/pages/', '').replace('/index.astro', '/');
        
        items.push({
          title: page.frontmatter.title,
          pubDate: page.frontmatter.pubDate || new Date(),
          description: page.frontmatter.description || '',
          link: slug,
        });
      }
    }
  }

  // ترتيب من الأحدث للأقدم
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return rss({
    title: 'Th.Tech - المدونة التقنية',
    description: 'أحدث المقالات والشروحات في الذكاء الاصطناعي والبرمجة',
    site: context.site,
    items: items,
    customData: `<language>ar-SA</language>`,
  });
}
