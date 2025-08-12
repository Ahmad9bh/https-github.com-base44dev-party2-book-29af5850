import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Grid } from 'lucide-react';

export default function ImageGallery({ images = [], venueTitle }) {
  const [open, setOpen] = useState(false);
  const displayImages = images.slice(0, 5);
  const remainingImages = images.length > 5;

  if (images.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-lg overflow-hidden h-96">
        {displayImages.map((src, index) => {
          let className = 'cursor-pointer hover:opacity-90 transition-opacity';
          if (index === 0) {
            className += ' col-span-2 row-span-2';
          }
          return (
            <div key={index} className={className} onClick={() => setOpen(true)}>
              <img src={src} alt={`${venueTitle} image ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          );
        })}
        {remainingImages && (
          <div className="absolute bottom-4 right-4">
            <Button onClick={() => setOpen(true)}>
              <Grid className="w-4 h-4 mr-2" />
              Show all photos
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{venueTitle}</DialogTitle>
          </DialogHeader>
          <Carousel className="w-full h-full flex items-center justify-center">
            <CarouselContent>
              {images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 flex items-center justify-center h-full">
                    <img src={src} alt={`${venueTitle} full ${index + 1}`} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}