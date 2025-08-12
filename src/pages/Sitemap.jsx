import React, { useState, useEffect } from 'react';
import { Venue } from '@/api/entities';

export default function Sitemap() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const activeVenues = await Venue.filter({ status: 'active' }, '-created_date', 100);
      setVenues(activeVenues || []);
    } catch (error) {
      console.error('Failed to load venues for sitemap:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSitemap = () => {
    const baseUrl = 'https://party2go.co';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/Browse', priority: '0.9', changefreq: 'daily' },
      { url: '/PublicHome', priority: '0.8', changefreq: 'weekly' },
      { url: '/VenueMap', priority: '0.7', changefreq: 'weekly' },
      { url: '/BrowseVendors', priority: '0.6', changefreq: 'weekly' },
      { url: '/SupportCenter', priority: '0.5', changefreq: 'monthly' },
      { url: '/TermsOfService', priority: '0.3', changefreq: 'yearly' },
      { url: '/PrivacyPolicy', priority: '0.3', changefreq: 'yearly' },
      { url: '/CancellationPolicy', priority: '0.3', changefreq: 'yearly' },
      { url: '/CommunityGuidelines', priority: '0.3', changefreq: 'yearly' }
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add venue detail pages
    venues.forEach(venue => {
      if (venue.id && venue.status === 'active') {
        sitemap += `
  <url>
    <loc>${baseUrl}/VenueDetails?id=${venue.id}</loc>
    <lastmod>${venue.updated_date ? venue.updated_date.split('T')[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    return sitemap;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Generating Sitemap...</h1>
        <div className="animate-pulse">Loading venue data...</div>
      </div>
    );
  }

  const sitemapXml = generateSitemap();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">XML Sitemap</h1>
      <p className="text-gray-600 mb-4">
        Generated sitemap with {venues.length} venue pages and static pages.
      </p>
      
      <div className="mb-4">
        <button
          onClick={() => {
            const blob = new Blob([sitemapXml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download sitemap.xml
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
        {sitemapXml}
      </pre>
    </div>
  );
}