import React, { useState, useEffect } from 'react';
import { ContentBlock } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Save, RefreshCw, Layers, Pencil } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const DEFAULT_CONTENT_BLOCKS = [
    { page_key: 'home_hero_title', page_name: 'Homepage', content: 'Find Your Perfect Event Venue', content_type: 'text', description: 'The main headline on the hero section of the homepage.' },
    { page_key: 'home_hero_subtitle', page_name: 'Homepage', content: 'Discover and book amazing venues for your special events', content_type: 'textarea', description: 'The sub-headline below the main title on the homepage.' },
    { page_key: 'home_cta_title', page_name: 'Homepage', content: 'Ready to Find Your Perfect Venue?', content_type: 'text', description: 'Title for the final call-to-action section.' },
    { page_key: 'home_cta_subtitle', page_name: 'Homepage', content: 'Join thousands of happy customers who found their ideal event space', content_type: 'textarea', description: 'Subtitle for the final call-to-action section.' },
    { page_key: 'terms_of_service_content', page_name: 'Legal Pages', content: '<h1>Terms of Service</h1><p>Welcome to Party2Go. By using our platform, you agree to these terms. Please read them carefully. The service is provided "as is" without warranties of any kind. We reserve the right to modify these terms at any time.</p>', content_type: 'rich_text', description: 'The full content of the Terms of Service page. Use HTML for formatting.' },
    { page_key: 'privacy_policy_content', page_name: 'Legal Pages', content: '<h1>Privacy Policy</h1><p>We value your privacy. This policy outlines how we collect, use, and protect your personal information. We collect data you provide during registration and booking. We do not sell your data to third parties.</p>', content_type: 'rich_text', description: 'The full content of the Privacy Policy page. Use HTML for formatting.' }
];

export default function ContentManager() {
  const [contentBlocks, setContentBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContentBlocks();
  }, []);

  const loadContentBlocks = async () => {
    setLoading(true);
    try {
      let blocks = await ContentBlock.list('-page_name');
      if (blocks.length === 0) {
        // First time setup: Create default blocks
        await ContentBlock.bulkCreate(DEFAULT_CONTENT_BLOCKS);
        blocks = await ContentBlock.list('-page_name');
      }
      setContentBlocks(blocks);
    } catch (err) {
      console.error('Failed to load content blocks:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load content from the database.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (id, newContent) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, content: newContent } : block
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        contentBlocks.map(block =>
          ContentBlock.update(block.id, { content: block.content })
        )
      );
      toast({
        title: 'Content Saved',
        description: 'All changes have been successfully saved and are now live.',
      });
    } catch (err) {
      console.error('Failed to save content blocks:', err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the content changes. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const groupedBlocks = contentBlocks.reduce((acc, block) => {
    (acc[block.page_name] = acc[block.page_name] || []).push(block);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="w-6 h-6" />
                    Content Management System
                </CardTitle>
                <CardDescription>
                    Edit the text and content on key pages of the application. Changes will be live immediately after saving.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={loadContentBlocks} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={handleSaveAll} disabled={saving}>
                    {saving ? <LoadingSpinner size="h-4 w-4" /> : <Save className="w-4 h-4 mr-2" />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={Object.keys(groupedBlocks)} className="w-full">
          {Object.entries(groupedBlocks).map(([pageName, blocks]) => (
            <AccordionItem key={pageName} value={pageName}>
              <AccordionTrigger className="text-lg font-medium">{pageName}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {blocks.map(block => (
                    <div key={block.id} className="p-4 border rounded-md">
                      <Label htmlFor={block.page_key} className="text-base font-semibold flex items-center gap-2">
                          <Pencil className="w-4 h-4 text-gray-500" />
                          {block.description}
                      </Label>
                      <p className="text-xs text-gray-500 mb-2 ml-6">KEY: <code className="bg-gray-100 px-1 rounded">{block.page_key}</code></p>
                      
                      {block.content_type === 'textarea' ? (
                        <Textarea
                          id={block.page_key}
                          value={block.content}
                          onChange={e => handleContentChange(block.id, e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      ) : block.content_type === 'rich_text' ? (
                        <Textarea
                          id={block.page_key}
                          value={block.content}
                          onChange={e => handleContentChange(block.id, e.target.value)}
                          className="mt-1 font-mono"
                          rows={12}
                        />
                      ) : (
                        <Input
                          id={block.page_key}
                          value={block.content}
                          onChange={e => handleContentChange(block.id, e.target.value)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}