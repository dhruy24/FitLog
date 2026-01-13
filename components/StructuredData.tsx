'use client';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

/**
 * Component to inject JSON-LD structured data into the page
 * This helps search engines understand the content better
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
