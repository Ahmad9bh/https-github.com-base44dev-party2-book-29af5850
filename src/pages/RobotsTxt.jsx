import React, { useEffect } from 'react';

export default function RobotsTxt() {
  useEffect(() => {
    // Set the content type for robots.txt
    document.title = 'robots.txt';
    
    // Generate robots.txt content
    const robotsContent = `User-agent: *
Allow: /

# Allow crawling of main pages
Allow: /Browse
Allow: /VenueDetails
Allow: /Home
Allow: /PublicHome

# Block admin and private pages
Disallow: /AdminDashboard
Disallow: /MyVenues
Disallow: /MyBookings
Disallow: /Payment
Disallow: /Messages
Disallow: /UserProfile

# Block test and development pages
Disallow: /Test*
Disallow: /Debug*
Disallow: /Flow*
Disallow: /Cleanup*
Disallow: /Configure*

# Sitemap
Sitemap: https://party2go.co/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

    // Create a downloadable robots.txt file
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Add download link to page
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'robots.txt';
    downloadLink.textContent = 'Download robots.txt';
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Robots.txt</h1>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">
{`User-agent: *
Allow: /

# Allow crawling of main pages
Allow: /Browse
Allow: /VenueDetails
Allow: /Home
Allow: /PublicHome

# Block admin and private pages
Disallow: /AdminDashboard
Disallow: /MyVenues
Disallow: /MyBookings
Disallow: /Payment
Disallow: /Messages
Disallow: /UserProfile

# Block test and development pages
Disallow: /Test*
Disallow: /Debug*
Disallow: /Flow*
Disallow: /Cleanup*
Disallow: /Configure*

# Sitemap
Sitemap: https://party2go.co/sitemap.xml

# Crawl-delay
Crawl-delay: 1`}
      </pre>
    </div>
  );
}