import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Hide admin panel from search engines
    },
    sitemap: 'https://ahmed-md-session-generator.vercel.app/sitemap.xml',
  };
}
