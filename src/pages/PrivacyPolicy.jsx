import React, { useState, useEffect } from 'react';
import { ContentBlock } from '@/api/entities';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PrivacyPolicy() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const contentBlock = await ContentBlock.filter({ page_key: 'privacy_policy_content' });
                if (contentBlock.length > 0) {
                    setContent(contentBlock[0].content);
                } else {
                    setContent('<h1>Privacy Policy</h1><p>Content not found. Please contact support.</p>');
                }
            } catch (err) {
                console.error("Failed to load Privacy Policy content", err);
                setContent('<h1>Error</h1><p>Could not load content. Please try again later.</p>');
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-md">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div
                        className="prose lg:prose-xl max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
            </div>
        </div>
    );
}