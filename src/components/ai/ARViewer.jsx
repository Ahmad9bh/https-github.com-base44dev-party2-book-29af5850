
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { View } from 'lucide-react'; // Changed from Cube to View

export default function ARViewer({ modelUrl, venueName }) {

  useEffect(() => {
    const scriptId = 'model-viewer-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <View className="w-5 h-5" /> {/* Changed from Cube to View */}
          View in Your Space (AR)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-4/5">
        <DialogHeader>
          <DialogTitle>AR Preview: {venueName}</DialogTitle>
        </DialogHeader>
        <div className="h-full w-full">
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*@ts-ignore*/}
          <model-viewer
            src={modelUrl}
            alt={`A 3D model of ${venueName}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            poster="https://images.unsplash.com/photo-1542042161-d19576c24g?auto=format&fit=crop&w=800&q=80"
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
          >
            <div className="progress-bar hide" slot="progress-bar">
                <div className="update-bar"></div>
            </div>
            <Button slot="ar-button" id="ar-button" className="ar-button">
                View in your space
            </Button>
          </model-viewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
