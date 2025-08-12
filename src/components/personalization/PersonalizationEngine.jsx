import { UserActivity } from '@/api/entities';
import { Venue } from '@/api/entities';

const PREFERENCE_WEIGHTS = {
  category: 3.0,
  city: 2.5,
  price: 2.0,
  amenity: 1.0,
};

const ACTIVITY_SCORES = {
  book: 10,
  favorite: 5,
  share: 3,
  view: 1,
};

// Function to get recommendations for a user
async function getRecommendations(userId, allVenues) {
  if (!userId || !allVenues || allVenues.length === 0) return [];

  const activities = await UserActivity.filter({ user_id: userId }, '-created_date', 100);
  if (activities.length === 0) return [];

  // 1. Calculate User Preference Profile
  const preferences = {
    categories: {},
    cities: {},
    priceRanges: {},
    amenities: {},
  };

  activities.forEach(activity => {
    const venue = allVenues.find(v => v.id === activity.venue_id);
    if (!venue) return;

    const score = ACTIVITY_SCORES[activity.activity_type] || 0;

    // Increment category scores
    if (venue.category && Array.isArray(venue.category)) {
      venue.category.forEach(cat => {
        preferences.categories[cat] = (preferences.categories[cat] || 0) + score;
      });
    }

    // Increment city scores
    if (venue.location?.city) {
      preferences.cities[venue.location.city] = (preferences.cities[venue.location.city] || 0) + score;
    }
    
    // Increment price range scores
    const priceRange = Math.floor((venue.price_per_hour || 0) / 100) * 100;
    preferences.priceRanges[priceRange] = (preferences.priceRanges[priceRange] || 0) + score;
    
    // Increment amenity scores
    if (venue.amenities && Array.isArray(venue.amenities)) {
        venue.amenities.forEach(amenity => {
            preferences.amenities[amenity] = (preferences.amenities[amenity] || 0) + score;
        });
    }
  });

  // 2. Score All Venues Based on Profile
  const scoredVenues = allVenues.map(venue => {
    let score = 0;
    
    // Score based on category match
    if (venue.category && Array.isArray(venue.category)) {
      venue.category.forEach(cat => {
        if (preferences.categories[cat]) {
          score += preferences.categories[cat] * PREFERENCE_WEIGHTS.category;
        }
      });
    }

    // Score based on city match
    if (venue.location?.city && preferences.cities[venue.location.city]) {
      score += preferences.cities[venue.location.city] * PREFERENCE_WEIGHTS.city;
    }

    // Score based on price range match
    const priceRange = Math.floor((venue.price_per_hour || 0) / 100) * 100;
    if (preferences.priceRanges[priceRange]) {
        score += preferences.priceRanges[priceRange] * PREFERENCE_WEIGHTS.price;
    }

    // Score based on amenities match
     if (venue.amenities && Array.isArray(venue.amenities)) {
        venue.amenities.forEach(amenity => {
            if(preferences.amenities[amenity]) {
                score += preferences.amenities[amenity] * PREFERENCE_WEIGHTS.amenity;
            }
        });
    }
    
    return { ...venue, recommendationScore: score };
  });

  // 3. Filter and Sort
  // Get IDs of venues user has already interacted with
  const interactedVenueIds = new Set(activities.map(a => a.venue_id));

  const finalRecommendations = scoredVenues
    .filter(venue => !interactedVenueIds.has(venue.id) && venue.recommendationScore > 0) // Filter out interacted and zero-score venues
    .sort((a, b) => b.recommendationScore - a.recommendationScore); // Sort by score

  return finalRecommendations.slice(0, 10); // Return top 10
}


export const PersonalizationEngine = {
  getRecommendations,
};