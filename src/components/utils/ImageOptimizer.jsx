import React, { useState } from 'react';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Check, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Client-side image compression
const compressImage = (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default function ImageOptimizer({ 
  onUploadComplete, 
  onUploadError, 
  maxFiles = 5,
  showPreview = true 
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const errors = [];
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Unsupported file type. Please use JPEG, PNG, or WebP.`);
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
    }
    
    return errors;
  };

  const handleFileUpload = async (files) => {
    const fileList = Array.from(files);
    
    if (fileList.length + uploadedImages.length > maxFiles) {
      setErrors([`Cannot upload more than ${maxFiles} images.`]);
      return;
    }

    // Validate all files first
    const allErrors = [];
    fileList.forEach(file => {
      allErrors.push(...validateFile(file));
    });
    
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setErrors([]);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = fileList.map(async (file, index) => {
        try {
          // Compress image before upload
          const compressedFile = await compressImage(file);
          const optimizedFile = new File([compressedFile], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          const result = await UploadFile({ file: optimizedFile });
          
          // Update progress
          const progress = ((index + 1) / fileList.length) * 100;
          setUploadProgress(progress);
          
          return {
            url: result.file_url,
            originalName: file.name,
            size: optimizedFile.size,
            status: 'success'
          };
        } catch (error) {
          return {
            originalName: file.name,
            error: error.message,
            status: 'error'
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(r => r.status === 'success');
      const failed = results.filter(r => r.status === 'error');
      
      if (successful.length > 0) {
        setUploadedImages(prev => [...prev, ...successful]);
        onUploadComplete(successful.map(r => r.url));
      }
      
      if (failed.length > 0) {
        setErrors(failed.map(f => `${f.originalName}: ${f.error}`));
        onUploadError(failed);
      }

    } catch (error) {
      setErrors(['Upload failed. Please try again.']);
      onUploadError([{ error: error.message }]);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUploadComplete(newImages.map(img => img.url));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="space-y-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Optimizing and uploading...' : 'Click to upload images'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB each (max {maxFiles} images)
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Optimizing and uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Image Preview */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images ({uploadedImages.length}/{maxFiles})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}