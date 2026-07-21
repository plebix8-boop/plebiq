import type { MetadataRoute } from "next";

const BASE_URL = "https://plebiq.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const publicPages = [
    { path: "", priority: 1.0 },
    { path: "/privacy-policy", priority: 0.8 },
    { path: "/terms-of-service", priority: 0.8 },
    { path: "/data-deletion", priority: 0.8 },
  ];

  // TODO: If public CMS/blog pages are added, fetch their published slugs here
  // during build/revalidation and append one entry per URL.
  return publicPages.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
