Perform a comprehensive production-level SEO audit and implementation for this Next.js App Router project.

The basic SEO setup (sitemap, robots, metadata) has already been implemented. Do NOT recreate those unless you find issues.

Your job is to improve every remaining technical SEO aspect.

Requirements:

1. Audit the entire project.
   - Find missing SEO opportunities.
   - Find duplicate metadata.
   - Find pages without metadata.
   - Find broken internal links.
   - Find missing canonical URLs.
   - Find pages with poor heading hierarchy.
   - Find images missing alt text.
   - Find pages that should not be indexed.

2. Structured Data (JSON-LD)
   Implement appropriate schema using built-in Next.js features.

   Use only schemas that make sense.

   Possible schemas:
   - Organization
   - WebSite
   - WebPage
   - BreadcrumbList
   - FAQPage
   - Article
   - Service
   - LocalBusiness (only if applicable)

   Do not generate fake business information.

3. Open Graph Improvements
   Verify every important page has:
   - og:title
   - og:description
   - og:url
   - og:type
   - og:image
   - twitter:card
   - twitter:title
   - twitter:description
   - twitter:image

4. Canonical URLs
   Ensure every indexable page has a correct canonical URL.

5. Core Web Vitals Optimization
   Audit the codebase for performance issues.

   Improve:
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Interaction to Next Paint (INP)

   Check for:
   - oversized images
   - unoptimized fonts
   - layout shifts
   - unnecessary client components
   - unnecessary JavaScript
   - render-blocking resources
   - large bundles

6. Image Optimization
   Audit every image.

   Replace standard img tags with next/image where appropriate.

   Ensure:
   - width/height specified
   - lazy loading
   - responsive sizing
   - modern formats where possible

7. Internal Linking
   Improve internal navigation.

   Recommend and implement logical internal links between related pages where appropriate.

8. Accessibility (SEO-related)
   Improve:
   - heading hierarchy
   - aria labels where needed
   - button/link accessibility
   - image alt text
   - semantic HTML

9. Indexing Rules
   Ensure pages like:
   - 404
   - error
   - admin
   - dashboard
   - private pages

   are marked noindex where appropriate.

10. Metadata Consistency
    Ensure:
    - no duplicate titles
    - no duplicate descriptions
    - reasonable title lengths
    - reasonable meta description lengths

11. Technical Cleanup
    Remove SEO anti-patterns such as:
    - duplicate metadata generation
    - duplicate canonical tags
    - conflicting robots directives
    - unnecessary metadata

12. Code Quality
    Follow Next.js App Router best practices.
    Keep the implementation clean, maintainable, and type-safe.

Deliverables:

1. SEO audit report
2. Files modified
3. Issues fixed
4. Remaining recommendations
5. SEO score (out of 100)
6. Performance improvement summary
7. Accessibility improvement summary
8. Structured data implemented
9. Any manual actions still required in Google Search Console or Google Analytics