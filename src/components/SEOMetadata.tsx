import { Helmet } from 'react-helmet-async';

interface SEOMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEOMetadata({
  title = "God's Way Enterprise | Genuine Spare Parts & Workshop in Ghana",
  description = "God's Way Enterprise is Ghana's leading provider of genuine car spare parts and professional garage services. Based in Abossey Okai, we serve Accra and beyond with quality parts and expert mechanics.",
  keywords = "spare parts Ghana, Abossey Okai parts, car repairs Accra, genuine auto parts Ghana, garage management Ghana, God's Way Enterprise",
  canonical = "https://godswayenterprise.com",
  ogImage = "https://godswayenterprise.com/og-image.jpg",
  ogType = "website"
}: SEOMetadataProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Local SEO for Ghana */}
      <meta name="geo.region" content="GH-AA" />
      <meta name="geo.placename" content="Accra" />
      <meta name="geo.position" content="5.5593; -0.2241" />
      <meta name="ICBM" content="5.5593, -0.2241" />
    </Helmet>
  );
}
