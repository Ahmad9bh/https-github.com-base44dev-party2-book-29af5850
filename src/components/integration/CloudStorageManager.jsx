import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Cloud, Upload, Download, Image, FileText, Video, Settings, CheckCircle, AlertTriangle, Trash2, Eye, Copy } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { MediaFile } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STORAGE_PROVIDERS = [
  {
    id: 'aws_s3',
    name: 'Amazon S3',
    icon: '🪣',
    features: ['Global CDN', 'Automatic Backup', 'Image Optimization'],
    pricing: '$0.023/GB/month'
  },
  {
    id: 'google_cloud',
    name: 'Google Cloud Storage',
    icon: '☁️',
    features: ['Auto-scaling', 'ML Integration', 'Global Network'],
    pricing: '$0.020/GB/month'
  },
  {
    id: 'azure_blob',
    name: 'Azure Blob Storage',
    icon: '🔷',
    features: ['Enterprise Security', 'Hybrid Cloud', 'AI Services'],
    pricing: '$0.024/GB/month'
  },
  {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    icon: '🛡️',
    features: ['Zero Egress Fees', 'Global Edge', 'DDoS Protection'],
    pricing: '$0.015/GB/month'
  }
];

const FILE_TYPES = [
  { type: 'image', extensions: ['.jpg', '.jpeg', '.png', '.webp'], maxSize: '10MB' },
  { type: 'video', extensions: ['.mp4', '.webm', '.mov'], maxSize: '100MB' },
  { type: 'document', extensions: ['.pdf', '.doc', '.docx'], maxSize: '25MB' }
];

export default function CloudStorageManager() {
  const [storageConfig, setStorageConfig] = useState({
    provider: 'aws_s3',
    region: 'us-east-1',
    bucket: 'party2go-storage',
    cdnEnabled: true,
    compressionEnabled: true,
    backupEnabled: true,
    encryptionEnabled: true
  });

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageStats, setStorageStats] = useState({
    totalStorage: 0,
    usedStorage: 0,
    fileCount: 0,
    monthlyTransfer: 0,
    cost: 0
  });

  const [optimizationSettings, setOptimizationSettings] = useState({
    autoResize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    webpConversion: true,
    thumbnailGeneration: true
  });

  const { success, error } = useToast();

  useEffect(() => {
    loadStorageData();
    loadStorageStats();
  }, []);

  const loadStorageData = async () => {
    try {
      const mediaFiles = await MediaFile.list('-created_date', 100);
      setFiles(mediaFiles || []);
    } catch (err) {
      console.error('Failed to load storage data:', err);
      error('Failed to load storage data');
    }
  };

  const loadStorageStats = async () => {
    // Simulate loading storage statistics
    const stats = {
      totalStorage: 1024 * 1024 * 1024 * 50, // 50GB
      usedStorage: 1024 * 1024 * 1024 * 12.5, // 12.5GB
      fileCount: 2847,
      monthlyTransfer: 1024 * 1024 * 1024 * 125, // 125GB
      cost: 34.56
    };
    
    setStorageStats(stats);
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Validate file type and size
        const fileType = getFileType(file.name);
        const maxSize = getMaxFileSize(fileType);
        
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        }

        // Simulate upload progress
        const progressIncrement = 100 / selectedFiles.length;
        
        // Upload file
        const uploadResult = await UploadFile({ file });
        
        // Create optimized versions
        const optimizedUrls = await createOptimizedVersions(uploadResult.file_url, fileType);
        
        // Save to database
        const mediaFile = await MediaFile.create({
          original_url: uploadResult.file_url,
          compressed_urls: optimizedUrls,
          file_type: fileType,
          file_size: file.size,
          compressed_sizes: calculateCompressedSizes(optimizedUrls),
          dimensions: fileType === 'image' ? await getImageDimensions(file) : null,
          optimization_status: 'completed'
        });

        // Update progress
        setUploadProgress(prev => prev + progressIncrement);
        
        return mediaFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      setFiles(prev => [...uploadedFiles, ...prev]);
      success(`Successfully uploaded ${uploadedFiles.length} files`);
      
      // Update storage stats
      loadStorageStats();
      
    } catch (err) {
      console.error('Upload failed:', err);
      error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const createOptimizedVersions = async (originalUrl, fileType) => {
    // Simulate creating optimized versions
    const versions = {};
    
    if (fileType === 'image') {
      versions.thumbnail = originalUrl.replace('.jpg', '_thumb.jpg');
      versions.medium = originalUrl.replace('.jpg', '_medium.jpg');
      versions.webp = originalUrl.replace('.jpg', '.webp');
    } else if (fileType === 'video') {
      versions.thumbnail = originalUrl.replace('.mp4', '_thumb.jpg');
      versions.preview = originalUrl.replace('.mp4', '_preview.mp4');
    }
    
    return versions;
  };

  const getFileType = (filename) => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return 'image';
    if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) return 'video';
    if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) return 'document';
    
    return 'other';
  };

  const getMaxFileSize = (fileType) => {
    switch (fileType) {
      case 'image': return 10 * 1024 * 1024; // 10MB
      case 'video': return 100 * 1024 * 1024; // 100MB
      case 'document': return 25 * 1024 * 1024; // 25MB
      default: return 5 * 1024 * 1024; // 5MB
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressedSizes = (versions) => {
    const sizes = {};
    Object.keys(versions).forEach(version => {
      // Simulate compressed sizes
      sizes[version] = Math.floor(Math.random() * 1024 * 1024 * 5); // 0-5MB
    });
    return sizes;
  };

  const getImageDimensions = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await MediaFile.delete(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      success('File deleted successfully');
      loadStorageStats();
    } catch (err) {
      console.error('Failed to delete file:', err);
      error('Failed to delete file');
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      success('URL copied to clipboard');
    } catch (err) {
      error('Failed to copy URL');
    }
  };

  const optimizeStorage = async () => {
    try {
      success('Storage optimization started...');
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update storage stats to show savings
      setStorageStats(prev => ({
        ...prev,
        usedStorage: prev.usedStorage * 0.85, // 15% reduction
        cost: prev.cost * 0.85
      }));
      
      success('Storage optimization completed! Saved 15% space and costs.');
    } catch (err) {
      error('Storage optimization failed');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <Image className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'document': return <FileText className="w-5 h-5 text-green-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const storageUsagePercent = (storageStats.usedStorage / storageStats.totalStorage) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cloud Storage Management</h1>
        <p className="text-gray-600">Manage file storage, optimization, and content delivery</p>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(storageStats.usedStorage)}
                </p>
              </div>
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={storageUsagePercent} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {storageUsagePercent.toFixed(1)}% of {formatFileSize(storageStats.totalStorage)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{storageStats.fileCount.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Transfer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(storageStats.monthlyTransfer)}
                </p>
              </div>
              <Download className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-green-600">${storageStats.cost.toFixed(2)}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files">File Management</TabsTrigger>
          <TabsTrigger value="upload">Upload & Optimize</TabsTrigger>
          <TabsTrigger value="config">Storage Config</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>File Library</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={optimizeStorage}>
                    <Settings className="w-4 h-4 mr-2" />
                    Optimize Storage
                  </Button>
                  <Button onClick={() => document.getElementById('file-upload').click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.file_type)}
                      <div>
                        <div className="font-medium">{file.original_url.split('/').pop()}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • {file.file_type}
                          {file.dimensions && (
                            <span> • {file.dimensions.width}×{file.dimensions.height}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={
                        file.optimization_status === 'completed' ? 'bg-green-100 text-green-800' :
                        file.optimization_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {file.optimization_status}
                      </Badge>
                      
                      <Button size="sm" variant="outline" onClick={() => handleCopyUrl(file.original_url)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline" onClick={() => window.open(file.original_url, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {files.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No files uploaded yet</p>
                    <Button className="mt-4" onClick={() => document.getElementById('file-upload').click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Upload & Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Uploading and optimizing files...</p>
                    <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                    <p className="text-sm text-gray-500">{uploadProgress.toFixed(0)}% complete</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Drop files here or click to upload</p>
                      <p className="text-gray-500">Supports images, videos, and documents</p>
                    </div>
                    <Button onClick={() => document.getElementById('file-upload').click()}>
                      Select Files
                    </Button>
                  </div>
                )}
              </div>

              {/* File Type Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FILE_TYPES.map(fileType => (
                  <Card key={fileType.type}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getFileIcon(fileType.type)}
                        <span className="font-medium capitalize">{fileType.type}s</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Extensions: {fileType.extensions.join(', ')}</p>
                        <p>Max size: {fileType.maxSize}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Optimization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-resize">Automatic Image Resizing</Label>
                    <Switch
                      id="auto-resize"
                      checked={optimizationSettings.autoResize}
                      onCheckedChange={(checked) => 
                        setOptimizationSettings(prev => ({ ...prev, autoResize: checked }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-width">Max Width (px)</Label>
                      <Input
                        id="max-width"
                        type="number"
                        value={optimizationSettings.maxWidth}
                        onChange={(e) => 
                          setOptimizationSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-height">Max Height (px)</Label>
                      <Input
                        id="max-height"
                        type="number"
                        value={optimizationSettings.maxHeight}
                        onChange={(e) => 
                          setOptimizationSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quality">Image Quality (%)</Label>
                    <Input
                      id="quality"
                      type="number"
                      min="10"
                      max="100"
                      value={optimizationSettings.quality}
                      onChange={(e) => 
                        setOptimizationSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="webp-conversion">WebP Conversion</Label>
                    <Switch
                      id="webp-conversion"
                      checked={optimizationSettings.webpConversion}
                      onCheckedChange={(checked) => 
                        setOptimizationSettings(prev => ({ ...prev, webpConversion: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="thumbnail-generation">Thumbnail Generation</Label>
                    <Switch
                      id="thumbnail-generation"
                      checked={optimizationSettings.thumbnailGeneration}
                      onCheckedChange={(checked) => 
                        setOptimizationSettings(prev => ({ ...prev, thumbnailGeneration: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Provider Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STORAGE_PROVIDERS.map(provider => (
                  <Card key={provider.id} className={`cursor-pointer transition-all ${
                    storageConfig.provider === provider.id ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.pricing}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {provider.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select value={storageConfig.region} onValueChange={(value) => 
                    setStorageConfig(prev => ({ ...prev, region: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bucket">Bucket Name</Label>
                  <Input
                    id="bucket"
                    value={storageConfig.bucket}
                    onChange={(e) => 
                      setStorageConfig(prev => ({ ...prev, bucket: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>CDN Enabled</Label>
                    <p className="text-sm text-gray-600">Enable global content delivery network</p>
                  </div>
                  <Switch
                    checked={storageConfig.cdnEnabled}
                    onCheckedChange={(checked) => 
                      setStorageConfig(prev => ({ ...prev, cdnEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compression Enabled</Label>
                    <p className="text-sm text-gray-600">Automatically compress uploaded files</p>
                  </div>
                  <Switch
                    checked={storageConfig.compressionEnabled}
                    onCheckedChange={(checked) => 
                      setStorageConfig(prev => ({ ...prev, compressionEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Enabled</Label>
                    <p className="text-sm text-gray-600">Create automatic backups of all files</p>
                  </div>
                  <Switch
                    checked={storageConfig.backupEnabled}
                    onCheckedChange={(checked) => 
                      setStorageConfig(prev => ({ ...prev, backupEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Encryption Enabled</Label>
                    <p className="text-sm text-gray-600">Encrypt files at rest and in transit</p>
                  </div>
                  <Switch
                    checked={storageConfig.encryptionEnabled}
                    onCheckedChange={(checked) => 
                      setStorageConfig(prev => ({ ...prev, encryptionEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-semibold">+{formatFileSize(1024 * 1024 * 1024 * 2.3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Month</span>
                    <span className="font-semibold">+{formatFileSize(1024 * 1024 * 1024 * 1.8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Monthly</span>
                    <span className="font-semibold">+{formatFileSize(1024 * 1024 * 1024 * 2.1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-blue-600" />
                      <span>Images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">23.5%</div>
                  <div className="text-sm text-gray-600">Storage Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">45%</div>
                  <div className="text-sm text-gray-600">Faster Loading</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">$127</div>
                  <div className="text-sm text-gray-600">Monthly Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}