import { iconLibraryManager } from './IconLibraryManager';
import { type IconItem, type LibrarySection } from '@/types/icon';

export interface SchemaMarkup {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

export class SchemaService {
  /**
   * Generate WebSite schema for search functionality
   */
  static generateWebSiteSchema(): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Iconstack",
      "alternateName": "Icon Stack",
      "url": "https://iconstack.io",
      "description": "50,000+ MIT-licensed icons from 20+ libraries with live customization and export",
      "keywords": "icons, svg, free icons, web development, ui design, icon library, open source",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://iconstack.io/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://twitter.com/inconstack"
      ]
    };
  }

  /**
   * Generate Organization schema for Ossian Design Lab
   */
  static generateOrganizationSchema(): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ossian Design Lab",
      "url": "https://iconstack.io",
      "logo": {
        "@type": "ImageObject",
        "url": "https://iconstack.io/favicon.svg",
        "width": "32",
        "height": "32"
      },
      "description": "Creator and publisher of Iconstack, the comprehensive icon library platform",
      "foundingDate": "2024",
      "sameAs": [
        "https://twitter.com/inconstack"
      ]
    };
  }

  /**
   * Generate Product/SoftwareApplication schema for Iconstack
   */
  static generateProductSchema(): SchemaMarkup {
    const totalIcons = iconLibraryManager.libraries.reduce((sum, lib) => sum + lib.count, 0);
    const libraryCount = iconLibraryManager.libraries.length;

    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Iconstack",
      "description": `50,000+ MIT-licensed icons from 20+ libraries with live customization and export. Access ${totalIcons.toLocaleString()} icons across ${libraryCount} curated libraries.`,
      "url": "https://iconstack.io",
      "applicationCategory": "DesignApplication",
      "applicationSubCategory": "Icon Library",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript",
      "softwareVersion": "1.0",
      "datePublished": "2024-01-01",
      "author": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31"
      },
      "featureList": [
        "50,000+ free SVG icons",
        "20+ curated icon libraries",
        "Live icon customization",
        "Multiple export formats",
        "MIT license",
        "Search and filter functionality",
        "Copy to clipboard",
        "Dark/light themes"
      ],
      "license": "https://opensource.org/licenses/MIT",
      "isAccessibleForFree": true,
      "screenshot": {
        "@type": "ImageObject",
        "url": "https://iconstack.io/lovable-uploads/98f14649-ca6b-4fda-8694-18be1925419a.png",
        "width": "1200",
        "height": "630"
      }
    };
  }

  /**
   * Generate CreativeWork schema for individual icon libraries
   */
  static generateCreativeWorkSchema(libraryId: string, icons?: IconItem[]): SchemaMarkup | null {
    const library = iconLibraryManager.libraries.find(lib => lib.id === libraryId);
    if (!library) return null;

    const iconCount = icons?.length || library.count;

    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": `${library.name} Icon Library`,
      "description": `${library.description} - ${iconCount.toLocaleString()} ${library.style} icons`,
      "url": `https://iconstack.io/library/${libraryId}`,
      "creator": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "license": "https://opensource.org/licenses/MIT",
      "isAccessibleForFree": true,
      "genre": "Icon Design",
      "keywords": `${library.name.toLowerCase()}, icons, svg, ${library.style}, web development, ui design`,
      "workExample": icons?.slice(0, 5).map(icon => ({
        "@type": "CreativeWork",
        "name": icon.name,
        "identifier": icon.id,
        "category": icon.category,
        "keywords": icon.tags?.join(', ')
      }))
    };
  }

  /**
   * Generate ItemList schema for icon collections
   */
  static generateItemListSchema(items: IconItem[], libraryName?: string): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": libraryName ? `${libraryName} Icons` : "Icon Collection",
      "description": `Collection of ${items.length} icons${libraryName ? ` from ${libraryName}` : ''}`,
      "numberOfItems": items.length,
      "itemListElement": items.slice(0, 20).map((icon, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": icon.name,
          "identifier": icon.id,
          "category": icon.category,
          "keywords": icon.tags?.join(', ')
        }
      }))
    };
  }

  /**
   * Generate BreadcrumbList schema for navigation
   */
  static generateBreadcrumbSchema(path: string): SchemaMarkup {
    const breadcrumbs = [
      { name: "Home", url: "https://iconstack.io" }
    ];

    if (path.startsWith('/library/')) {
      const libraryId = path.split('/')[2];
      const library = iconLibraryManager.libraries.find(lib => lib.id === libraryId);
      if (library) {
        breadcrumbs.push({
          name: `${library.name} Icons`,
          url: `https://iconstack.io/library/${libraryId}`
        });
      }
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  /**
   * Generate Dataset schema for icon collections
   */
  static generateDatasetSchema(): SchemaMarkup {
    const totalIcons = iconLibraryManager.libraries.reduce((sum, lib) => sum + lib.count, 0);
    const libraryCount = iconLibraryManager.libraries.length;

    return {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Iconstack Icon Database",
      "description": `Comprehensive database of ${totalIcons.toLocaleString()} MIT-licensed icons from ${libraryCount} curated libraries`,
      "url": "https://iconstack.io",
      "keywords": "icons, svg, database, open source, web development, ui design",
      "creator": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ossian Design Lab"
      },
      "license": "https://opensource.org/licenses/MIT",
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "SVG",
        "contentUrl": "https://iconstack.io"
      },
      "includedInDataCatalog": {
        "@type": "DataCatalog",
        "name": "Open Source Icon Libraries"
      }
    };
  }

  /**
   * Generate FAQ schema for common questions
   */
  static generateFAQSchema(): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are the icons free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, all icons on Iconstack are MIT-licensed and completely free for commercial and personal use."
          }
        },
        {
          "@type": "Question",
          "name": "How many icons are available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Iconstack provides access to over ${iconLibraryManager.libraries.reduce((sum, lib) => sum + lib.count, 0).toLocaleString()} icons from ${iconLibraryManager.libraries.length} different libraries.`
          }
        },
        {
          "@type": "Question",
          "name": "Can I customize the icons?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can customize icon colors, stroke width, and other properties in real-time before copying or downloading."
          }
        },
        {
          "@type": "Question",
          "name": "What format are the icons in?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All icons are provided as scalable SVG format, perfect for web development and design projects."
          }
        }
      ]
    };
  }

  /**
   * Combine multiple schemas into a single JSON-LD object
   */
  static combineSchemas(schemas: SchemaMarkup[]): any {
    if (schemas.length === 1) {
      return schemas[0];
    }

    return {
      "@context": "https://schema.org",
      "@graph": schemas
    };
  }
}