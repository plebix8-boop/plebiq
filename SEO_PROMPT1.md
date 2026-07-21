Analyze this Next.js project (App Router) and implement all missing basic SEO files using Next.js Metadata APIs.

Requirements:

1. Create app/sitemap.ts
   - Generate a valid XML sitemap using Next.js MetadataRoute.Sitemap.
   - Use https://plebiq.com as the base URL.
   - Include all important static pages in the project.
   - Set:
     - homepage priority = 1.0
     - other pages priority = 0.8
     - changeFrequency = "weekly"
     - lastModified = new Date()
   - Exclude 404 pages, API routes, private pages, and dynamic routes that cannot be enumerated.

2. Create app/robots.ts
   - Allow all crawling.
   - Point to:
       https://plebiq.com/sitemap.xml
   - Use MetadataRoute.Robots.

3. Inspect the project for dynamic routes.
   - If blog posts or CMS pages exist and can be fetched during build time, include them automatically in sitemap.ts.
   - If they cannot be enumerated, leave a clear TODO comment explaining how to include them later.

4. Review the root layout metadata.
   - Ensure metadataBase is set to:
       https://plebiq.com
   - Add a default title and title template if missing.
   - Add description if missing.
   - Add canonical URL support.
   - Add Open Graph metadata.
   - Add Twitter metadata.
   - Add robots metadata.

5. Verify that every page has appropriate metadata.
   - Use generateMetadata where appropriate.
   - Avoid duplicate titles/descriptions.

6. Do not install any third-party SEO libraries unless absolutely necessary.
   - Use only built-in Next.js Metadata APIs.

7. After implementation, provide:
   - list of created files
   - list of modified files
   - sitemap URL
   - robots URL
   - any remaining SEO recommendations.