import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BusinessDashboard from "./pages/BusinessDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import Support from "./pages/Support";
import ProjectEdit from "./pages/ProjectEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/business-dashboard" 
              element={
                <ProtectedRoute requiredRole="business">
                  <BusinessDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor-dashboard" 
              element={
                <ProtectedRoute requiredRole="editor">
                  <EditorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:id" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:id/edit" 
              element={
                <ProtectedRoute>
                  <ProjectEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
