import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Eye, Star } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { useLanguage } from '@/contexts/LanguageContext'; // Removed

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  // const { t } = useLanguage(); // Removed

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-300 hover:scale-105 hover:shadow-md" 
            variant="outline"
            onClick={() => navigate('/upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Content
          </Button>
          <Button className="w-full justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-md" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
          <Button className="w-full justify-start hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-md" variant="outline">
            <Star className="h-4 w-4 mr-2" />
            Rate Recent Work
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm animate-fade-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300">
            <div className="h-2 w-2 bg-emerald-500 rounded-full mt-2 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Project Completed</p>
              <p className="text-xs text-gray-500">Valentine's Day Promo Delivered</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-300">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Editor Assigned</p>
              <p className="text-xs text-gray-500">Mike Started Working</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-amber-50 transition-colors duration-300">
            <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">New Project Created</p>
              <p className="text-xs text-gray-500">Weekend Sale Uploaded</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support / Help Center Button */}
      <Button
        asChild
        className={`justify-start border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200 mt-2 max-w-[85%] ml-auto`}
        variant="outline"
      >
        <Link to="/support">
          Support / Help Center
        </Link>
      </Button>
    </div>
  );
};

export default DashboardSidebar;
