import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, BrainCircuit, Sparkles, X } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';
import { getLocalizedText } from '@/components/common/FormatUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SemanticSearch({ venues, onResults, currentLanguage, currentCurrency }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter what you're looking for.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const prompt = `
        Analyze the following user query for finding an event venue: "${query}".
        The user is currently using the currency "${currentCurrency}".
        Based on the query, extract the following information into a JSON object:
        - event_type (e.g., "wedding", "birthday", "corporate")
        - location (city name)
        - capacity_range (e.g., "50-100", ">200")
        - budget_range (e.g., "<$100/hr", "$200-500/hr")
        - amenities (a list of requested amenities like "parking", "projector")
        - style (e.g., "modern", "outdoor", "luxury")
        
        If a value is not mentioned, omit the key from the JSON. Respond only with the JSON object.
      `;
      
      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            event_type: { type: "string" },
            location: { type: "string" },
            capacity_range: { type: "string" },
            budget_range: { type: "string" },
            amenities: { type: "array", items: { type: "string" } },
            style: { type: "string" }
          }
        }
      });
      
      const interpretedNeeds = response;

      // Filter venues based on interpreted needs
      const filteredVenues = venues.filter(venue => {
        let score = 0;
        let matchReasons = [];

        if (interpretedNeeds.location && venue.location?.city?.toLowerCase().includes(interpretedNeeds.location.toLowerCase())) {
          score += 10;
          matchReasons.push(`Located in ${interpretedNeeds.location}`);
        }
        if (interpretedNeeds.event_type && venue.category?.includes(interpretedNeeds.event_type)) {
          score += 5;
          matchReasons.push(`Suitable for ${interpretedNeeds.event_type} events`);
        }
        if (interpretedNeeds.style && venue.description?.toLowerCase().includes(interpretedNeeds.style.toLowerCase())) {
          score += 3;
           matchReasons.push(`Matches style: ${interpretedNeeds.style}`);
        }
        if (interpretedNeeds.amenities && interpretedNeeds.amenities.every(a => venue.amenities?.includes(a))) {
          score += 2 * interpretedNeeds.amenities.length;
           matchReasons.push(`Has all requested amenities`);
        }
        
        venue.matchScore = score;
        venue.matchReasons = matchReasons;
        return score > 0;
      }).sort((a, b) => b.matchScore - a.matchScore);

      onResults(filteredVenues, interpretedNeeds);

    } catch (error) {
      console.error('Semantic search failed:', error);
      toast({
        title: "AI Search Error",
        description: "Could not process your request. Please try a simpler search.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 p-4 border bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
      <div className="flex items-center gap-2">
         <BrainCircuit className="w-6 h-6 text-indigo-600" />
         <h3 className="text-lg font-semibold text-gray-900">
           {getLocalizedText('ai_powered_search_title', currentLanguage) || 'AI Powered Search'}
         </h3>
      </div>
       <p className="text-sm text-gray-600">
        {getLocalizedText('ai_powered_search_description', currentLanguage) || "Describe your ideal venue in plain language. For example: 'A modern venue in Dubai for a corporate event of 100 people with a projector'"}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={getLocalizedText('ai_search_placeholder', currentLanguage) || "Tell us what you're looking for..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-12"
            disabled={isLoading}
          />
        </div>
        <Button 
          size="lg" 
          className="h-12 px-6"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            getLocalizedText('search', currentLanguage)
          )}
        </Button>
      </div>
    </div>
  );
}