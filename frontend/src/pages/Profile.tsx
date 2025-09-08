import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UploadCloud, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profilePicture || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let profilePicture = user?.profilePicture;
      if (image) {
        // Upload to backend and get the URL
        const uploadRes = await apiClient.uploadProfilePicture(image);
        profilePicture = uploadRes.profilePicture;
      }
      const updated = await apiClient.updateProfile(name, email);
      updateUser({ ...updated, profilePicture });
      setSuccess(true);
      setTimeout(() => {
        if (updated.role === 'business') {
          navigate('/business-dashboard');
        } else if (updated.role === 'editor') {
          navigate('/editor-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Get the correct dashboard route based on user role
  const getDashboardRoute = () => {
    if (user?.role === 'business') return '/business-dashboard';
    if (user?.role === 'editor') return '/editor-dashboard';
    return '/';
  };

  // Always use the backend value if available after refresh
  useEffect(() => {
    setImagePreview(user?.profilePicture || null);
  }, [user]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-4">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/user profile.png" alt="Profile background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-blue-100/60 to-teal-100/80 backdrop-blur-md" />
      </div>
      
      {/* Foreground content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-md mb-6">
          <Button
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 text-white shadow-lg hover:from-teal-700 hover:via-emerald-600 hover:to-orange-600 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate(getDashboardRoute())}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500">
          Profile
        </h1>
        
        <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Edit your profile information</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <img
                  src={imagePreview || "/profile.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-200 shadow-lg transition-opacity duration-200 bg-gray-100"
                  onError={e => { e.currentTarget.src = '/profile.png'; }}
                />
                <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-teal-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-teal-700 transition-colors border-2 border-white">
                  <UploadCloud className="w-4 h-4 text-white" />
                  <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div className="text-sm text-gray-500 text-center">
                Click the camera icon to upload a new profile picture
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                placeholder="Enter your email"
                type="email"
              />
            </div>

            {/* Role Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                {user?.role || 'No role assigned'}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
                Profile updated successfully! Redirecting...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(getDashboardRoute())}
                className="flex-1 rounded-lg border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2 shadow-md transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-xs text-gray-500 max-w-md text-center">
          Your profile information will be updated across all platforms.
        </div>
      </div>
    </div>
  );
};

export default Profile;