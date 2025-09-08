import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userType, setUserType] = useState<'business' | 'editor'>('business');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { login } = useAuth();
  // const { t } = useLanguage(); // Removed

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      // Get the user from context after login
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === 'business') {
        navigate('/business-dashboard');
      } else if (storedUser.role === 'editor') {
        navigate('/editor-dashboard');
      } else {
        navigate('/');
      }
      toast({
        title: "Login successful!",
        description: `Welcome back, ${storedUser.name}!`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/login.png" alt="Login background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-100/60 to-teal-100/80 backdrop-blur-md" />
      </div>
      {/* Foreground content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-pointer">
                <span className="rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
                  <Camera className="w-8 h-8 text-white transition-all duration-300" />
                </span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                  ReelLocal
                </h1>
              </div>
              {/* <LanguageSelector /> // Removed */}
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Login to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={userType === 'business' ? 'default' : 'ghost'}
                onClick={() => setUserType('business')}
                className={`flex-1 ${userType === 'business' ? 'bg-teal-600 text-white' : ''}`}
              >
                Business
              </Button>
              <Button
                variant={userType === 'editor' ? 'default' : 'ghost'}
                onClick={() => setUserType('editor')}
                className={`flex-1 ${userType === 'editor' ? 'bg-orange-500 text-white' : ''}`}
              >
                Editor
              </Button>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In' : 'Sign In'}
              </Button>
            </div>

            <Separator />

            {/* Social Login */}
            {/* <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full">
                Continue with Facebook
              </Button>
            </div> */}

            <div className="text-center text-sm text-gray-600">
              Don't have an account? {" "}
              <Button variant="link" className="p-0 h-auto text-teal-600" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
