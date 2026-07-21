export function SiteStructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://plebiq.com/#organization",
    name: "Plebiq",
    url: "https://plebiq.com",
    logo: "https://plebiq.com/logo.png",
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://plebiq.com/#website",
    name: "Plebiq",
    url: "https://plebiq.com",
    description: "A social voting platform where the world shares opinions and votes on the questions that matter.",
    publisher: { "@id": "https://plebiq.com/#organization" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
