import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, X, Play, Image, Clock, DollarSign, FileVideo, FileImage, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, getTemplates, API_BASE_URL } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
// import LanguageSelector from '@/components/LanguageSelector'; // Removed
// import { useLanguage } from '@/contexts/LanguageContext'; // Removed

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const packages = [
  {
    key: 'quick_buzz',
    name: '🎬 Quick Buzz',
    duration: 'Up to 30s',
    features: ['Standard edit', 'Music'],
    price: 499
  },
  {
    key: 'smooth_flow',
    name: '✂️ Smooth Flow',
    duration: 'Up to 45s',
    features: ['Standard edit', 'Music'],
    price: 799
  },
  {
    key: 'full_impact',
    name: '🚀 Full Impact',
    duration: 'Up to 60s',
    features: ['Transitions', 'Polish'],
    price: 999
  },
  {
    key: 'master_reel',
    name: '🎥 Master Reel',
    duration: '60+ sec',
    features: ['Custom editing', 'Text overlays', 'Sound design', 'Captions', 'Multiple clips', 'Color grading', 'Smooth transitions', 'Social media aspect ratio'],
    price: 1999
  }
];

const addonOptions = [
  { key: 'captions', label: 'Captions/Subtitles', price: 49 },
  { key: 'trending_audio', label: 'Trending Audio Sync', price: 29 },
  { key: 'logo_animation', label: 'Logo Animation', price: 259 },
];

const Upload = () => {
  const navigate = useNavigate();
  const { user, refreshStats } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { t } = useLanguage(); // Removed
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    isPublic: false
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [errorTemplates, setErrorTemplates] = useState<string | null>(null);
  const [shopDetails, setShopDetails] = useState({
    name: '',
    tagline: '',
    address: '',
    offer: ''
  });
  const [editors, setEditors] = useState<any[]>([]);
  const [selectedEditor, setSelectedEditor] = useState<string>("");
  const [addons, setAddons] = useState({
    voiceover: false,
    script: false,
    subtitles: false
  });
  const [selectedPackage, setSelectedPackage] = useState('quick_buzz');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    getTemplates()
      .then((data) => {
        setTemplates(data.templates || []);
        setErrorTemplates(null);
      })
      .catch(() => setErrorTemplates('Failed to load templates'))
      .finally(() => setLoadingTemplates(false));
    // Fetch editors
    fetch(`${API_BASE_URL}/editors`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setEditors(data.editors || []));
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('video/') || file.type.startsWith('image/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
      return isValidType && isValidSize;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => {
      const uploadedFile: UploadedFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      return uploadedFile;
    });

    setUploadedFiles([...uploadedFiles, ...newFiles]);

    if (files.length !== validFiles.length) {
      toast({
        title: "Some files were skipped",
        description: "Only video and image files under 100MB are allowed.",
        variant: "destructive"
      });
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Map form categories to backend allowed values
  const CATEGORY_MAP: Record<string, string> = {
    'food': 'marketing',
    'fashion': 'marketing',
    'fitness': 'personal',
    'retail': 'marketing',
    'tech': 'corporate',
    'beauty': 'personal',
    'other': 'other'
  };

  const getBackendCategory = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t._id === selectedTemplate);
      if (template && CATEGORY_MAP[template.category]) {
        return CATEGORY_MAP[template.category];
      }
    }
    // fallback to form selection
    if (formData.category && CATEGORY_MAP[formData.category]) {
      return CATEGORY_MAP[formData.category];
    }
    return formData.category || 'other';
  };

  const getPackagePrice = () => packages.find(p => p.key === selectedPackage)?.price || 0;
  const getAddonsPrice = () => selectedAddons.reduce((sum, key) => sum + (addonOptions.find(a => a.key === key)?.price || 0), 0);
  const totalPrice = getPackagePrice() + getAddonsPrice();

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a project title.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a project description.",
        variant: "destructive"
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Files required",
        description: "Please upload at least one file.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create project first
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];
      if (shopDetails.tagline && !tagsArray.includes(shopDetails.tagline)) {
        tagsArray.push(shopDetails.tagline);
      }
      const projectData: any = {
        title: formData.title,
        description: formData.description,
        category: getBackendCategory(),
        tags: tagsArray,
        isPublic: formData.isPublic,
        shopDetails,
        addons,
        files: uploadedFiles.map(f => f.file),
        package: selectedPackage,
        selectedAddons,
        totalPrice,
        budget: budget ? Number(budget) : undefined,
        deadline,
        industry,
      };
      if (selectedEditor && selectedEditor !== "auto") {
        projectData.editor = selectedEditor;
      }

      const project = await apiClient.createProject(projectData);

      // Upload all raw files for the project using the new API
      if (uploadedFiles.length > 0) {
        try {
          const formData = new FormData();
          uploadedFiles.forEach(f => formData.append('files', f.file));
          
          const uploadResponse = await fetch(`${API_BASE_URL}/upload/raw/${project._id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Upload failed');
          }
          
          const uploadResult = await uploadResponse.json();
          console.log('Upload result:', uploadResult);
          
          toast({
            title: 'Files uploaded successfully!',
            description: `${uploadedFiles.length} files uploaded to Cloudinary.`,
            duration: 3000
          });
        } catch (uploadError) {
          console.error('Failed to upload raw files:', uploadError);
          toast({
            title: 'File upload error',
            description: uploadError.message || 'Some files could not be uploaded. Please try again.',
            variant: 'destructive',
          });
        }
      }

      // Refresh stats
      await refreshStats();

      toast({
        title: "Project created successfully!",
        description: "Your project has been created and files uploaded.",
        duration: 5000
      });

      // Navigate to dashboard
      navigate('/business-dashboard');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast({
        title: "Failed to create project",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/upload.png" alt="Upload background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      </div>
      {/* Foreground content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
                    <Camera className="w-8 h-8 text-white transition-all duration-300" />
                  </span>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                    ReelLocal
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* <LanguageSelector /> */}
                <Button
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 text-white shadow-lg hover:from-teal-700 hover:via-emerald-600 hover:to-orange-600 hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                  onClick={() => navigate('/business-dashboard')}
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                Create New Project
              </span>
            </h2>
            <p className="text-lg text-gray-600">Upload your content to create a new project.</p>
          </div>

          {/* Package Selection */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map(pkg => (
                <div
                  key={pkg.key}
                  className={`cursor-pointer rounded-2xl border-2 p-6 shadow-md transition-all duration-200 ${selectedPackage === pkg.key ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-orange-50 scale-105' : 'border-gray-200 bg-white hover:border-teal-300'}`}
                  onClick={() => setSelectedPackage(pkg.key)}
                >
                  <div className="flex items-center gap-2 mb-2 text-xl font-bold">{pkg.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{pkg.duration}</div>
                  <ul className="mb-2 text-gray-700 text-sm list-disc pl-5">
                    {pkg.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <div className="text-lg font-bold text-teal-700">₹{pkg.price}{pkg.key === 'master_reel' ? '+' : ''}</div>
                  {selectedPackage === pkg.key && <div className="mt-2 text-xs text-teal-600 font-semibold">Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add-ons <span className="text-base font-normal text-gray-500">(Optional)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {addonOptions.map(addon => (
                <label key={addon.key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedAddons.includes(addon.key) ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.key)}
                    onChange={e => {
                      if (e.target.checked) setSelectedAddons([...selectedAddons, addon.key]);
                      else setSelectedAddons(selectedAddons.filter(k => k !== addon.key));
                    }}
                    className="w-5 h-5 accent-teal-500"
                  />
                  <span className="text-base font-medium">{addon.label}</span>
                  <span className="ml-auto text-teal-700 font-semibold">+₹{addon.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Details */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Project Details</CardTitle>
                  <CardDescription className="text-gray-600">Enter project details to get started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold text-gray-700 mb-2 block">Project Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter project title" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-semibold text-gray-700 mb-2 block">Project Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter project description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="industry" className="text-base font-semibold text-gray-700 mb-2 block">Industry</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="deadline" className="text-base font-semibold text-gray-700 mb-2 block">Deadline</Label>
                      <Select>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select deadline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="48h">48 hours</SelectItem>
                          <SelectItem value="72h">72 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shop Details */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Shop Details</CardTitle>
                  <CardDescription className="text-gray-600">Provide your shop details for branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="shop-name" className="text-base font-semibold text-gray-700 mb-2 block">Shop Name</Label>
                    <Input id="shop-name" value={shopDetails.name} onChange={e => setShopDetails({ ...shopDetails, name: e.target.value })} className="h-12 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="shop-tagline" className="text-base font-semibold text-gray-700 mb-2 block">Shop Tagline</Label>
                    <Input id="shop-tagline" value={shopDetails.tagline} onChange={e => setShopDetails({ ...shopDetails, tagline: e.target.value })} className="h-12 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="shop-address" className="text-base font-semibold text-gray-700 mb-2 block">Shop Address</Label>
                    <Input id="shop-address" value={shopDetails.address} onChange={e => setShopDetails({ ...shopDetails, address: e.target.value })} className="h-12 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="shop-offer" className="text-base font-semibold text-gray-700 mb-2 block">Shop Offer</Label>
                    <Input id="shop-offer" value={shopDetails.offer} onChange={e => setShopDetails({ ...shopDetails, offer: e.target.value })} className="h-12 text-base" />
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Add-ons</CardTitle>
                  <CardDescription className="text-gray-600">Select extra services for your video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input type="checkbox" checked={addons.voiceover} onChange={e => setAddons({ ...addons, voiceover: e.target.checked })} className="w-5 h-5" />
                    <span className="text-base font-medium">Voiceover</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input type="checkbox" checked={addons.script} onChange={e => setAddons({ ...addons, script: e.target.checked })} className="w-5 h-5" />
                    <span className="text-base font-medium">Script Writing</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input type="checkbox" checked={addons.subtitles} onChange={e => setAddons({ ...addons, subtitles: e.target.checked })} className="w-5 h-5" />
                    <span className="text-base font-medium">Subtitles</span>
                  </label>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Upload Your Content</CardTitle>
                  <CardDescription className="text-gray-600">Drag and drop your files or click to browse.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 cursor-pointer bg-gray-50/50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 hover:text-teal-500 transition-colors" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Drag and drop files here
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Or click to browse
                    </p>
                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="video/*,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length})</h4>
                      <div className="space-y-3">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              {file.type.startsWith('video/') ? (
                                <FileVideo className="h-5 w-5 text-blue-500" />
                              ) : (
                                <FileImage className="h-5 w-5 text-green-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Final Preview */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Final Preview</CardTitle>
                  <CardDescription className="text-gray-600">Review your order before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Title:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{formData.title || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Description:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{formData.description || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Industry:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{getBackendCategory() || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Shop Name:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{shopDetails.name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Shop Tagline:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{shopDetails.tagline || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Shop Address:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{shopDetails.address || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Shop Offer:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{shopDetails.offer || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Add-ons:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{Object.entries(addons).filter(([k, v]) => v).map(([k]) => k).join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 text-base">Advanced Features:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base flex flex-wrap gap-2 justify-end">
                      {selectedPackage === 'full_impact' || selectedPackage === 'master_reel' ? (
                        <>
                          {selectedPackage === 'full_impact' && <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Transitions</span>}
                          {selectedPackage === 'full_impact' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Polish</span>}
                          {selectedPackage === 'master_reel' && <>
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Custom Editing</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Text Overlays</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Color Grading</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Multiple Clips</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Aspect Ratio</span>
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Sound Design</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Captions</span>
                          </>}
                        </>
                      ) : <span className="text-gray-400">None</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-3">
                    <span className="font-semibold text-gray-700 text-base">Files:</span>
                    <span className="text-gray-900 max-w-xs text-right text-base">{uploadedFiles.length} uploaded</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Project Summary */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-orange-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">₹{getPackagePrice()}</span>
                  </div>
                  {selectedAddons.map(key => {
                    const addon = addonOptions.find(a => a.key === key);
                    return addon ? (
                      <div className="flex justify-between" key={key}>
                        <span className="text-gray-600">{addon.label}:</span>
                        <span className="font-medium">+₹{addon.price}</span>
                  </div>
                    ) : null;
                  })}
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Create Project Button */}
              <Button 
                className="w-full bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Project...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
