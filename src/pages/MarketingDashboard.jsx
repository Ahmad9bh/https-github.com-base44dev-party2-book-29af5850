
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { GenerateImage } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Download, Copy, Share2, Megaphone, Target, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createPageUrl } from '@/utils';

export default function MarketingDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const { toast } = useToast();

  const [marketingAssets, setMarketingAssets] = useState({
    generatedImages: [],
    socialPosts: [],
    emailTemplates: []
  });

  const [imagePrompt, setImagePrompt] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(currentUser);

      const [venueList, vendorList] = await Promise.all([
        Venue.list('-created_date', 100),
        Vendor.list('-created_date', 100)
      ]);

      setVenues(venueList || []);
      setVendors(vendorList || []);
      
      generateMarketingTemplates();
    } catch (error) {
      console.error('Failed to load data:', error);
      window.location.href = createPageUrl('Home');
    } finally {
      setLoading(false);
    }
  };

  const generateMarketingTemplates = () => {
    const activeVenues = venues.filter(v => v.status === 'active');
    const activeVendors = vendors.filter(v => v.status === 'active');
    
    const socialPosts = [
      {
        platform: 'Instagram',
        content: `🎉 Your perfect event starts here! 
📍 ${activeVenues.length}+ premium venues across UAE
🎯 ${activeVendors.length}+ professional vendors
💫 One platform, endless possibilities

#Party2Go #EventPlanning #UAE #Dubai #Riyadh`,
        hashtags: ['#Party2Go', '#EventPlanning', '#UAE', '#Dubai', '#Riyadh']
      },
      {
        platform: 'LinkedIn',
        content: `Announcing Party2Go - the premier event venue and vendor marketplace for the Middle East.

✅ ${activeVenues.length}+ verified venues
✅ ${activeVendors.length}+ professional service providers  
✅ Streamlined booking process
✅ Secure payment processing

Transform your event planning experience today.`,
        hashtags: ['#EventTech', '#BusinessEvents', '#UAE', '#EventPlanning']
      },
      {
        platform: 'Twitter',
        content: `🚀 Party2Go is live! Find your perfect event venue + vendors in one place. ${activeVenues.length}+ venues, ${activeVendors.length}+ vendors. The future of event planning is here! 🎪`,
        hashtags: ['#Party2Go', '#EventPlanning', '#LaunchDay']
      }
    ];

    const emailTemplates = [
      {
        subject: 'Welcome to Party2Go - Your Event Planning Just Got Easier',
        type: 'Welcome Email',
        content: `Hi [First Name],

Welcome to Party2Go! 🎉

You now have access to ${activeVenues.length}+ premium venues and ${activeVendors.length}+ professional vendors across the UAE.

Getting started is easy:
1. Browse our curated venues
2. Connect with verified vendors
3. Book with confidence

Ready to plan your next unforgettable event?

Best regards,
The Party2Go Team`
      },
      {
        subject: 'Launch Special: Book Your Event Venue Today',
        type: 'Promotional Email',
        content: `Don't miss out! 🎯

Party2Go is officially live with:
• ${activeVenues.length}+ stunning venues
• ${activeVendors.length}+ trusted vendors
• Secure booking & payment
• 24/7 customer support

Book your next event today and join hundreds of satisfied customers.

[Browse Venues] [Find Vendors]`
      }
    ];

    setMarketingAssets({
      generatedImages: [],
      socialPosts,
      emailTemplates
    });
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter an image description');
      return;
    }

    setGeneratingImage(true);
    try {
      const result = await GenerateImage({
        prompt: `Professional marketing image for Party2Go event platform: ${imagePrompt}. High quality, modern design, elegant, suitable for social media and marketing materials.`
      });

      const newImage = {
        id: Date.now(),
        url: result.url,
        prompt: imagePrompt,
        createdAt: new Date().toISOString()
      };

      setMarketingAssets(prev => ({
        ...prev,
        generatedImages: [newImage, ...prev.generatedImages]
      }));

      toast.success('Marketing image generated successfully!');
      setImagePrompt('');
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Dashboard</h1>
        <p className="text-gray-600">Create and manage marketing materials for Party2Go</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Creation</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="assets">Brand Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Image Generation</CardTitle>
                <CardDescription>Create custom marketing images for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Describe the marketing image you want to create..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGenerateImage} 
                      disabled={generatingImage || !imagePrompt.trim()}
                    >
                      {generatingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>

                  {marketingAssets.generatedImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketingAssets.generatedImages.map(image => (
                        <Card key={image.id}>
                          <CardContent className="p-4">
                            <img 
                              src={image.url} 
                              alt={image.prompt}
                              className="w-full h-48 object-cover rounded mb-3"
                            />
                            <p className="text-sm text-gray-600 mb-3">{image.prompt}</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={image.url} download target="_blank">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(image.url)}>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy URL
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <div className="space-y-6">
            {marketingAssets.socialPosts.map((post, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    {post.platform} Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      value={post.content} 
                      readOnly 
                      rows={6}
                      className="font-medium"
                    />
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => copyToClipboard(post.content)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Post
                      </Button>
                      <Button variant="outline" onClick={() => copyToClipboard(post.hashtags.join(' '))}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Hashtags
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="space-y-6">
            {marketingAssets.emailTemplates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {template.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Subject Line:</label>
                      <Input value={template.subject} readOnly className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Content:</label>
                      <Textarea 
                        value={template.content} 
                        readOnly 
                        rows={8}
                        className="mt-1"
                      />
                    </div>
                    <Button variant="outline" onClick={() => copyToClipboard(`Subject: ${template.subject}\n\n${template.content}`)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Email Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Colors</h4>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-indigo-600 rounded border" title="Primary Blue"></div>
                      <div className="w-12 h-12 bg-gray-900 rounded border" title="Dark Gray"></div>
                      <div className="w-12 h-12 bg-white rounded border" title="White"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Logo Usage</h4>
                    <div className="p-4 border rounded bg-gray-50">
                      <div className="text-2xl font-bold text-indigo-600">Party2Go</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Typography</h4>
                    <p className="text-gray-600">Primary: Inter (Sans-serif)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={createPageUrl('ContentManager')}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Content
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    const url = window.location.origin + createPageUrl('Home');
                    copyToClipboard(url);
                  }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Platform URL
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.origin), '_blank');
                  }}>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Share on Facebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
