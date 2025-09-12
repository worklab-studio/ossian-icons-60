import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SchemaService, type SchemaMarkup } from '@/services/SchemaService';
import { type IconItem } from '@/types/icon';

interface UseSchemaMarkupOptions {
  icons?: IconItem[];
  libraryId?: string;
  iconName?: string;
  totalIcons?: number;
  includeFAQ?: boolean;
}

export function useSchemaMarkup(options: UseSchemaMarkupOptions = {}) {
  const location = useLocation();
  const { icons, libraryId, iconName, totalIcons, includeFAQ } = options;

  const schemaMarkup = useMemo(() => {
    const schemas: SchemaMarkup[] = [];
    
    // Base schemas for all pages
    schemas.push(SchemaService.generateWebSiteSchema());
    schemas.push(SchemaService.generateOrganizationSchema());
    schemas.push(SchemaService.generateProductSchema());
    
    // Breadcrumb navigation
    schemas.push(SchemaService.generateBreadcrumbSchema(location.pathname, iconName));
    
    // Page-specific schemas
    if (location.pathname === '/') {
      // Homepage specific schemas
      schemas.push(SchemaService.generateDatasetSchema());
      
      if (includeFAQ) {
        schemas.push(SchemaService.generateFAQSchema());
      }
    } else if (libraryId && location.pathname.startsWith('/library/')) {
      // Library page specific schemas
      const creativeWorkSchema = SchemaService.generateCreativeWorkSchema(libraryId, icons);
      if (creativeWorkSchema) {
        schemas.push(creativeWorkSchema);
      }
      
      if (icons && icons.length > 0) {
        schemas.push(SchemaService.generateItemListSchema(icons, libraryId));
      }
    } else if (location.pathname.startsWith('/icon/')) {
      // Individual icon page schemas
      if (libraryId && iconName) {
        const creativeWorkSchema = SchemaService.generateCreativeWorkSchema(libraryId);
        if (creativeWorkSchema) {
          schemas.push(creativeWorkSchema);
        }
      }
    } else if (location.pathname === '/demo/icons') {
      // Demo page schemas
      schemas.push(SchemaService.generateDatasetSchema());
    }
    
    // Combine all schemas
    return SchemaService.combineSchemas(schemas);
  }, [location.pathname, icons, libraryId, iconName, totalIcons, includeFAQ]);

  return {
    schemaMarkup,
    jsonLd: JSON.stringify(schemaMarkup, null, 2)
  };
}