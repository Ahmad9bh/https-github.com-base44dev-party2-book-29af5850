import React, { useState, useEffect, useRef } from 'react';

export default function VenueNav({ links }) {
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // Use the ref to get the top position of the nav bar
      if (navRef.current && window.scrollY > navRef.current.offsetTop) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = (e, ref) => {
    e.preventDefault();
    if (ref?.current) {
      // Adjust scroll position to account for the sticky nav's height
      const topOffset = isSticky ? 80 : 20;
      const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div ref={navRef} className="h-16"> {/* Wrapper to get position */}
      {isSticky && <div className="h-16" />} {/* Placeholder to prevent content jump */}
      <div
        className={`w-full bg-white z-40 transition-shadow duration-200 ${
          isSticky
            ? 'fixed top-0 left-0 right-0 shadow-md border-b border-gray-200'
            : 'relative border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <nav className="flex space-x-8">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={`#${link.name.toLowerCase()}`}
                  onClick={(e) => handleLinkClick(e, link.ref)}
                  className="text-gray-600 hover:text-blue-600 font-medium text-sm border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}