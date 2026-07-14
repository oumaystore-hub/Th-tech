import rss from '@astrojs/rss';

// البحث عن جميع ملفات astro في المجلدات الفرعية
const allFiles = import.meta.glob('/src/pages/*/*.{astro,md}', { eager: true });

export function GET(context) {
  const items = [];

  for (const path in allFiles) {
    const file = allFiles[path];
    
    // تجاهل index الرئيسي و 404
    if (!path.includes('pages/index.astro') && !path.includes('404')) {
      if (file.frontmatter && file.frontmatter.title) {
        // استخراج المسار
        let slug = path.replace('/src/pages/', '').replace('.astro', '/').replace('/index/', '/');
        
        items.push({
          title: file.frontmatter.title,
          pubDate: file.frontmatter.pubDate || new Date(),
          description: file.frontmatter.description || '',
          link: slug,
        });
      }
    }
  }

  // الترتيب من الأحدث للأقدم
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return rss({
    title: 'Th.Tech - المدونة التقنية',
    description: 'أحدث المقالات والشروحات في الذكاء الاصطناعي والبرمجة',
    site: context.site,
    items: items,
    customData: `<language>ar-SA</language>`,
  });
}
