import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Orbit } from 'lucide-react'; // Using Orbit as a proxy for VR/3D view

export default function VRVenueTour({ venueName, imageUrl }) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Orbit className="w-5 h-5" />
          Virtual Reality Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>VR Tour: {venueName}</DialogTitle>
          <DialogDescription>
            Use your mouse to look around. On mobile, move your device.
          </DialogDescription>
        </DialogHeader>
        <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
            {/* 
              This is a placeholder. A real implementation would use a library like
              react-pannellum, A-Frame, or a custom Three.js component to render 
              a 360-degree image or a full VR scene.
            */}
            <img src={imageUrl} alt={`360 view of ${venueName}`} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <p className="text-white text-lg font-bold">360° Virtual Tour Placeholder</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}