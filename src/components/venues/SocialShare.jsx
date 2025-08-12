import React from 'react';
import { Share2, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/toast';

const SocialShare = ({ venue, isMobile = false }) => {
  const { toast } = useToast();
  
  if (!venue) return null;

  const shareUrl = `${window.location.origin}/VenueDetails?id=${venue.id}`;
  const shareTitle = `Check out this venue: ${venue.title}`;
  const shareDescription = venue.description?.substring(0, 150) + '...';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "You can now share the link with your friends.",
    });
  };

  const shareOptions = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      )
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9s-1.4 1.4-3.3 1.4H6.3c-1.4 0-1.4-1.4-1.4-1.4s.7-1.4 1.4-1.4H3.3s1.4-1.4 2.8-2.8H3.3c-1.4 0-2.8-2.8-2.8-2.8s1.4-1.4 2.8-1.4c1.4 0 2.8 1.4 2.8 1.4s1.4-2.8 2.8-2.8c-1.4 0-1.4-1.4-1.4-1.4s1.4-1.4 2.8-1.4c1.4 0 2.8 2.8 2.8 2.8s.7-2.1 2-3.4c-1.4-1.4-3.3-4.9-3.3-4.9s1.4-1.4 3.3-1.4z"></path></svg>
      )
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareDescription)}`,
      icon: (
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      )
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      icon: <MessageCircle className="h-5 w-5"/>
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-center">Share this venue</h4>
          <div className="flex justify-center items-center gap-4">
            {shareOptions.map(option => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                title={`Share on ${option.name}`}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                  {option.icon}
                </div>
                <span className="text-xs">{option.name}</span>
              </a>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full pl-3 pr-10 py-2 border rounded-md bg-gray-50 text-sm"
            />
            <button
              onClick={copyLink}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShare;