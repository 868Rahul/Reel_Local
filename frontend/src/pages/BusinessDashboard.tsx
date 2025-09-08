// src/pages/BusinessDashboard.jsx

import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const BusinessDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "User";
  const role = user?.role || "Business User";

  return (
    <ProtectedRoute requiredRole="business">
      <div className="min-h-screen relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/business.png"
            alt="Dashboard background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 min-h-screen">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
                  <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                    Welcome Back, {firstName}!
                  </span>
                </h2>
                <p className="text-gray-600 text-lg mt-1">Manage Projects</p>
              </div>
            </div>

            <StatsSection />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ProjectsSection />
              <DashboardSidebar />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BusinessDashboard;
