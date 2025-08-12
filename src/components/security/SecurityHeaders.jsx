import { useEffect } from 'react';

export default function SecurityHeaders() {
  useEffect(() => {
    // Check environment using window location instead of process
    const isDevelopment = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('preview'));

    // Disable right-click in production (optional)
    if (!isDevelopment) {
      const handleContextMenu = (e) => {
        e.preventDefault();
      };
      
      const handleKeyDown = (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      
      // Cleanup listeners on unmount
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    // Add security meta tags dynamically if not present
    const metaTags = [
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' }
    ];

    metaTags.forEach(tag => {
      const existing = document.querySelector(`meta[name="${tag.name}"], meta[http-equiv="${tag['http-equiv']}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag['http-equiv']) meta.setAttribute('http-equiv', tag['http-equiv']);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }, []);

  return null;
}