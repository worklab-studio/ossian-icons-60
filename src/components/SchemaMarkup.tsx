import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SchemaMarkupProps {
  schema: any;
  validate?: boolean;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({
  schema, 
  validate = process.env.NODE_ENV === 'development' 
}) => {
  // Validate schema in development
  React.useEffect(() => {
    if (validate && schema) {
      try {
        // Basic validation - ensure it's valid JSON
        const jsonString = JSON.stringify(schema);
        JSON.parse(jsonString);
        
        // Log schema for debugging
        console.log('📋 Schema.org JSON-LD:', schema);
        
        // Check for required fields
        if (!schema['@context'] || !schema['@type']) {
          console.warn('⚠️ Schema missing required @context or @type fields');
        }
      } catch (error) {
        console.error('❌ Invalid Schema.org JSON-LD:', error);
      }
    }
  }, [schema, validate]);

  if (!schema) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};