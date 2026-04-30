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
      "alternateName": "Iconstack",
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
        "https://twitter.com/iconstack"
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
        "https://twitter.com/iconstack"
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
   * Generate ImageObject schema for an individual icon — boosts Google Images
   * and structured-data eligibility on icon detail pages.
   */
  static generateIconImageObjectSchema(icon: IconItem, libraryId: string, iconSlug: string): SchemaMarkup | null {
    const library = iconLibraryManager.libraries.find(lib => lib.id === libraryId);
    if (!library) return null;

    const url = `https://iconstack.io/icon/${libraryId}/${iconSlug}`;
    const keywords = [
      icon.name,
      `${icon.name} icon`,
      `${icon.name} svg`,
      library.name,
      library.style,
      ...(icon.tags || []).slice(0, 8),
    ].filter(Boolean).join(', ');

    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "name": `${icon.name} icon`,
      "alternateName": icon.name,
      "description": `${icon.name} SVG icon from the ${library.name} icon library — free, MIT-licensed, fully customizable.`,
      "contentUrl": url,
      "url": url,
      "encodingFormat": "image/svg+xml",
      "width": "24",
      "height": "24",
      "representativeOfPage": true,
      "isAccessibleForFree": true,
      "license": "https://opensource.org/licenses/MIT",
      "acquireLicensePage": "https://iconstack.io/license",
      "creditText": library.name,
      "creator": {
        "@type": "Organization",
        "name": library.name
      },
      "copyrightNotice": `${library.name} — MIT License`,
      "keywords": keywords,
      "category": icon.category || library.style,
      "isPartOf": {
        "@type": "CreativeWork",
        "name": `${library.name} Icon Library`,
        "url": `https://iconstack.io/library/${libraryId}`
      }
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
  static generateBreadcrumbSchema(path: string, iconName?: string): SchemaMarkup {
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
    } else if (path.startsWith('/icon/')) {
      const pathParts = path.split('/');
      const libraryId = pathParts[2];
      const iconSlug = pathParts[3];
      const library = iconLibraryManager.libraries.find(lib => lib.id === libraryId);
      
      if (library) {
        breadcrumbs.push({
          name: `${library.name} Icons`,
          url: `https://iconstack.io/library/${libraryId}`
        });
        
        if (iconName) {
          breadcrumbs.push({
            name: iconName,
            url: `https://iconstack.io/icon/${libraryId}/${iconSlug}`
          });
        }
      }
    } else if (path === '/demo/icons') {
      breadcrumbs.push({
        name: "Demo Icons",
        url: "https://iconstack.io/demo/icons"
      });
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
   * Generate library-specific FAQ schema for rich snippets
   */
  static generateLibraryFAQSchema(libraryName: string, count: number, style?: string): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `How many ${libraryName} icons are available?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${libraryName} offers ${count.toLocaleString()} ${style || ''} icons on Iconstack. Browse the complete list, search for specific icons, or filter by category.`
          }
        },
        {
          "@type": "Question",
          "name": `Are ${libraryName} icons free to use?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes, all ${libraryName} icons are MIT-licensed and completely free for both personal and commercial projects. No attribution is required.`
          }
        },
        {
          "@type": "Question",
          "name": `What styles does ${libraryName} offer?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": style
              ? `${libraryName} icons are available in ${style} style. You can customize them on Iconstack by adjusting color and stroke width.`
              : `${libraryName} icons can be customized on Iconstack by adjusting color and stroke width.`
          }
        },
        {
          "@type": "Question",
          "name": `How do I use ${libraryName} icons in my project?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Search for the icon you need, click to copy the SVG code, and paste it into your HTML, React, Vue, or any other project. You can also download icons as SVG or PNG files.`
          }
        },
        {
          "@type": "Question",
          "name": `Can I customize ${libraryName} icons?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes! Use the customization panel to change the icon color and stroke width in real-time. Customizations are applied before copying or downloading.`
          }
        }
      ]
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
   * Generate Article schema for a blog post
   */
  static generateArticleSchema(post: { title: string; excerpt: string; publishedAt: string; author: string; coverImage?: { asset?: { _ref?: string } }; slug: { current: string } }): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author || "Iconstack Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ossian Design Lab",
        "logo": {
          "@type": "ImageObject",
          "url": "https://iconstack.io/favicon.svg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://iconstack.io/blog/${post.slug.current}`
      },
      "url": `https://iconstack.io/blog/${post.slug.current}`
    };
  }

  /**
   * Generate ItemList schema for the blog index
   */
  static generateBlogListSchema(posts: { title: string; slug: { current: string }; excerpt: string }[]): SchemaMarkup {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Iconstack Blog",
      "description": "Guides, tips & resources for using icons in web development",
      "numberOfItems": posts.length,
      "itemListElement": posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": post.title,
          "url": `https://iconstack.io/blog/${post.slug.current}`,
          "description": post.excerpt
        }
      }))
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