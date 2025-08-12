import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { UserPreference } from '@/api/entities';
import { useToast } from '@/components/ui/toast';

const ONBOARDING_STEPS = [
  {
    id: 'event_types',
    title: 'What types of events do you host?',
    icon: Calendar,
    type: 'multi_select',
    options: ['Wedding', 'Birthday', 'Corporate', 'Conference', 'Party', 'Graduation', 'Anniversary']
  },
  {
    id: 'budget_range',
    title: 'What\'s your typical budget per hour?',
    icon: DollarSign,
    type: 'range',
    min: 50,
    max: 1000,
    step: 25
  },
  {
    id: 'guest_capacity',
    title: 'How many guests do you usually host?',
    icon: Users,
    type: 'range',
    min: 10,
    max: 500,
    step: 10
  },
  {
    id: 'preferred_locations',
    title: 'Which areas do you prefer?',
    icon: MapPin,
    type: 'multi_select',
    options: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Jeddah', 'Dammam', 'Doha', 'Kuwait City']
  },
  {
    id: 'amenities',
    title: 'Which amenities are important to you?',
    icon: Sparkles,
    type: 'multi_select',
    options: ['Parking', 'WiFi', 'Sound System', 'Projector', 'Kitchen Access', 'Dance Floor', 'Outdoor Space']
  }
];

export default function SmartOnboarding({ userId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const { success } = useToast();

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const handleResponse = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentStepData.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      // Save all preferences
      for (const [stepId, value] of Object.entries(responses)) {
        const step = ONBOARDING_STEPS.find(s => s.id === stepId);
        
        if (Array.isArray(value)) {
          // Multi-select responses
          for (const item of value) {
            await UserPreference.create({
              user_id: userId,
              preference_type: stepId === 'event_types' ? 'event_type_preference' : 
                             stepId === 'preferred_locations' ? 'location_preference' : 
                             'amenity_preference',
              preference_value: item,
              weight: 1.0,
              learned_from_behavior: false,
              last_updated: new Date().toISOString()
            });
          }
        } else if (step.type === 'range') {
          // Range responses
          await UserPreference.create({
            user_id: userId,
            preference_type: stepId === 'budget_range' ? 'price_range' : 'capacity_range',
            preference_value: `${value[0]}-${value[1]}`,
            weight: 1.0,
            learned_from_behavior: false,
            last_updated: new Date().toISOString()
          });
        }
      }

      success('Preferences saved! We\'ll personalize your experience.');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding preferences:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStepContent = () => {
    const step = currentStepData;
    const Icon = step.icon;

    switch (step.type) {
      case 'multi_select':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {step.options.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={(responses[step.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const current = responses[step.id] || [];
                      const updated = checked
                        ? [...current, option]
                        : current.filter(item => item !== option);
                      handleResponse(updated);
                    }}
                  />
                  <label htmlFor={option} className="text-sm font-medium">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'range':
        const value = responses[step.id] || [step.min, Math.floor((step.min + step.max) / 2)];
        return (
          <div className="space-y-6">
            <div className="px-4">
              <Slider
                value={value}
                onValueChange={handleResponse}
                min={step.min}
                max={step.max}
                step={step.step}
                minStepsBetweenThumbs={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>${value[0]}</span>
              <span>${value[1]}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold">Let's personalize your experience</h1>
        </div>
        <div className="flex items-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <currentStepData.icon className="w-6 h-6 text-indigo-600" />
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!responses[currentStepData.id] || isCompleting}
              className="flex items-center gap-2"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                isCompleting ? 'Saving...' : 'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}