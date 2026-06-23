import { person, builds } from "../data/person";

const SITE = person.url;
const personId = `${SITE}/#person`;
const siteId = `${SITE}/#website`;

/** Site-wide nodes emitted on every page: Person, WebSite, and the apps. */
export function siteGraph(): object[] {
  return [
    {
      "@type": "Person",
      "@id": personId,
      name: person.name,
      url: `${SITE}/about/`,
      jobTitle: person.jobTitle,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bentonville",
        addressRegion: "AR",
        addressCountry: "US",
      },
      alumniOf: { "@type": "CollegeOrUniversity", name: person.alumniOf },
      knowsAbout: person.knowsAbout,
      sameAs: [person.linkedin, person.github],
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: SITE,
      name: person.name,
      publisher: { "@id": personId },
      inLanguage: "en-US",
    },
    ...builds
      .filter((b) => b.appCategory)
      .map((b) => ({
        "@type": "SoftwareApplication",
        name: b.name,
        applicationCategory: b.appCategory,
        operatingSystem: b.os,
        url: b.href,
        author: { "@id": personId },
        description: b.tagline,
      })),
  ];
}

interface ArticleOpts {
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  url: string;
  pdfUrl: string;
}

/** TechArticle for a practitioner white paper (not ScholarlyArticle). */
export function techArticle(o: ArticleOpts): object {
  return {
    "@type": "TechArticle",
    headline: o.title,
    description: o.description,
    datePublished: o.date.toISOString(),
    dateModified: (o.updated ?? o.date).toISOString(),
    author: { "@id": personId },
    publisher: { "@id": personId },
    mainEntityOfPage: o.url,
    url: o.url,
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: o.pdfUrl,
      encodingFormat: "application/pdf",
    },
  };
}

export function breadcrumb(items: { name: string; url: string }[]): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
