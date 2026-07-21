Perform a complete production SEO audit of the LIVE website:

https://plebiq.com

Do not audit only the source code.
Audit the actual deployed website exactly as search engines and users see it.

Your task is to identify every remaining SEO issue that could affect crawling, indexing, rankings, user experience, or Core Web Vitals.

=====================================
CRAWLING & INDEXING
=====================================

Check:

- robots.txt
- sitemap.xml
- sitemap validity
- XML format
- broken sitemap URLs
- canonical URLs
- indexability
- noindex pages
- redirects
- redirect chains
- redirect loops
- orphan pages
- duplicate URLs
- www/non-www consistency
- HTTP → HTTPS redirects
- trailing slash consistency

=====================================
METADATA
=====================================

Audit every important page.

Check for:

- unique title
- title length
- unique meta description
- description length
- canonical tag
- robots meta
- Open Graph
- Twitter Card
- favicon
- manifest
- metadataBase
- hreflang (if needed)

Find duplicates and missing metadata.

=====================================
STRUCTURED DATA
=====================================

Validate JSON-LD.

Check:

- Organization
- Website
- Breadcrumb
- Service
- FAQ
- Article
- WebPage

Verify schemas are valid.

Report any warnings.

=====================================
CONTENT SEO
=====================================

Review:

- H1 usage
- H2 hierarchy
- duplicate headings
- keyword relevance
- thin pages
- empty pages
- duplicate content
- internal linking
- anchor text quality

=====================================
IMAGE SEO
=====================================

Check every image.

Find:

- missing alt text
- oversized images
- missing width/height
- images not using next/image
- missing lazy loading

=====================================
PERFORMANCE
=====================================

Audit:

- Core Web Vitals
- Largest Contentful Paint
- Cumulative Layout Shift
- Interaction to Next Paint
- JavaScript bundle size
- unused JavaScript
- render blocking resources
- image optimization
- font optimization
- caching
- compression
- preconnect
- preload opportunities

=====================================
ACCESSIBILITY
=====================================

Audit:

- semantic HTML
- heading hierarchy
- labels
- buttons
- links
- contrast issues
- keyboard accessibility
- alt text

=====================================
LINKS
=====================================

Check:

- broken internal links
- broken external links
- redirecting links
- orphan pages

=====================================
NEXT.JS BEST PRACTICES
=====================================

Check whether the production build follows Next.js App Router best practices.

Verify:

- Metadata API usage
- generateMetadata
- server components where appropriate
- unnecessary client components
- image optimization
- font optimization
- route segment metadata

=====================================
SEARCH CONSOLE READINESS
=====================================

Verify that the production website is ready for:

- Google Search Console
- Bing Webmaster Tools
- social sharing
- AI search engines
- rich results

=====================================
SECURITY
=====================================

Check:

- HTTPS
- security headers
- mixed content
- X-Robots-Tag issues

=====================================
REPORT
=====================================

Produce a detailed report containing:

1. Critical Issues
2. High Priority Issues
3. Medium Priority Issues
4. Low Priority Improvements

For every issue include:

- Explanation
- Why it matters
- How to fix it
- File(s) affected (if applicable)

Finally provide:

- Overall SEO Score (/100)
- Technical SEO Score
- Performance Score
- Accessibility Score
- Content Score
- Structured Data Score

Estimate the site's readiness for Google indexing.

Do not make assumptions.

Base every finding on the live deployed website.