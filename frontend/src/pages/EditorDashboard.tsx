import React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, DollarSign, Upload, Eye, Play, BadgeCheck, Camera, Bell, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/api/api";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

const EditorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);

  // View Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);

  const [earnings, setEarnings] = useState<any>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<string | null>(null);
  const [completedProjects, setCompletedProjects] = useState<number>(0);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProject, setViewProject] = useState<any>(null);

  const [finalVideoFile, setFinalVideoFile] = useState<File | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {

    console.log('API Client instance:', apiClient);
    console.log('API Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient)));
    const fetchData = async () => {
      try {
        // Fetch available jobs using apiClient
        setLoadingJobs(true);
        const jobsData = await apiClient.getAvailableJobs();
        setAvailableJobs(jobsData.jobs || []);
        setErrorJobs(null);
      } catch (err) {
        setErrorJobs('Failed to load available jobs');
        console.error('Error loading jobs:', err);
      } finally {
        setLoadingJobs(false);
      }

      try {
        // Fetch editor projects using apiClient
        setLoadingProjects(true);
        const projectsData = await apiClient.getEditorProjects();
        setMyProjects(projectsData.projects || []);
        setErrorProjects(null);
      } catch (err) {
        setErrorProjects('Failed to load your projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoadingProjects(false);
      }

      try {
        // Fetch earnings using apiClient
        setLoadingEarnings(true);
        const earningsData = await apiClient.getEditorEarnings();
        setEarnings(earningsData);
      } catch (err) {
        console.error('Error loading earnings:', err);
        setEarnings(null);
      } finally {
        setLoadingEarnings(false);
      }

      try {
        // Fetch reviews using apiClient
        const reviewsData = await apiClient.getEditorReviews(user._id);
        setReviews(reviewsData.reviews || []);
        setAvgRating(reviewsData.averageRating);
        setCompletedProjects(reviewsData.completedProjects || 0);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setReviews([]);
      }

      try {
        // Add a small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch notifications using apiClient
        const notificationsData = await apiClient.getNotifications();
        setNotifications(notificationsData.notifications || []);
        setUnreadCount((notificationsData.notifications || []).filter((n: any) => !n.read).length);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Food': 'bg-orange-100 text-orange-800',
      'Fashion': 'bg-purple-100 text-purple-800',
      'Fitness': 'bg-green-100 text-green-800',
      'Tech': 'bg-blue-100 text-blue-800'
    };
    return colors[industry] || 'bg-gray-100 text-gray-800';
  };

  // Quick stats
  const totalEarnings = myProjects.reduce((sum, p) => sum + (parseInt(p.earnings) || 0), 0);
  const projectsDone = myProjects.filter(p => p.status === 'delivered' || p.status === 'completed').length;
  const activeProjects = myProjects.filter(p => p.status === 'in-progress').length;
  
  // Calculate average rating from all reviews across all projects
  const allReviews = myProjects.flatMap(p => p.reviews || []);
  const avgProjectRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
    : '4.5'; // Default rating as requested

  // Accept Project handler
  const handleAcceptProject = async (job: any) => {
    try {
      await apiClient.addCollaborator(job._id, user._id, 'editor');
      toast({ title: 'Project accepted!', variant: 'success' });
      // Refresh jobs and projects using apiClient
      const jobsData = await apiClient.getAvailableJobs();
      setAvailableJobs(jobsData.jobs || []);
      
      const projectsData = await apiClient.getEditorProjects();
      setMyProjects(projectsData.projects || []);
    } catch (err: any) {
      toast({ title: 'Failed to accept project', description: err.message, variant: 'destructive' });
    }
  };

  // Quick Tools handlers (placeholders)
  const handleVideoEditor = () => toast({ title: 'Video Editor tool coming soon!' });
  const handleUploadPortfolio = () => toast({ title: 'Upload Portfolio coming soon!' });
  const handlePaymentHistory = () => toast({ title: 'Payment History coming soon!' });

  // Upload handler - updated to use apiClient
  const handleUploadClick = (projectId: string) => {
    setUploadingProjectId(projectId);
    setUploadModalOpen(true);
    setUploadProgress(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFinalVideoFile(file || null);
    if (!file || !uploadingProjectId) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Use apiClient for upload
      await apiClient.uploadFinalVideo(uploadingProjectId, file);
      
      setUploading(false);
      setUploadModalOpen(false);
      setUploadingProjectId(null);
      setUploadProgress(0);
      setFinalVideoFile(null);
      
      toast({ title: 'Upload successful! Project marked as completed.', variant: 'success' });
      refreshAllData();
    } catch (err: any) {
      setUploading(false);
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleViewProject = async (projectId: string) => {
    try {
      const latestProject = await apiClient.getProject(projectId);
      setViewProject(latestProject);
      setViewModalOpen(true);
    } catch (err: any) {
      toast({ title: 'Failed to load project', description: err.message, variant: 'destructive' });
    }
  };

  const refreshAllData = async () => {
    try {
      setLoadingJobs(true);
      const jobsData = await apiClient.getAvailableJobs();
      setAvailableJobs(jobsData.jobs || []);
      setErrorJobs(null);
    } catch (err) {
      setErrorJobs('Failed to load available jobs');
      console.error('Error refreshing jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
    
    try {
      setLoadingProjects(true);
      const projectsData = await apiClient.getEditorProjects();
      setMyProjects(projectsData.projects || []);
      setErrorProjects(null);
    } catch (err) {
      setErrorProjects('Failed to load your projects');
      console.error('Error refreshing projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => apiClient.markNotificationAsRead(id)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/editor.png" alt="Editor Dashboard background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-100/40 to-teal-100/40 backdrop-blur-sm" />
      </div>
      {/* Foreground content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <ProtectedRoute requiredRole="editor">
          <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-2 animate-fade-in group cursor-pointer">
                    <span className="flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
                      <Camera className="w-8 h-8 text-white transition-all duration-300" />
                    </span>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                      ReelLocal
                    </h1>
                    <Badge className="ml-4 bg-orange-100 text-orange-800">Editor</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    {user && (
                      <>
                        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                          <DropdownMenuTrigger asChild>
                            <button className="relative focus:outline-none">
                              <Bell className="h-6 w-6 text-gray-700" />
                              {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-400 text-white text-xs rounded-full px-2 py-0.5 shadow-lg animate-bounce border-2 border-white">{unreadCount}</span>
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl bg-gradient-to-br from-white/10 via-blue-50 to-emerald-50 backdrop-blur-lg border border-gray-200 p-0">
                            <div className="flex items-center justify-between font-semibold px-4 py-3 border-b text-gray-800 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
                              <span>Notifications</span>
                              {unreadCount > 0 && (
                                <button
                                  onClick={markAllAsRead}
                                  className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg shadow-sm border border-blue-200 transition-all duration-200 hover:scale-105 focus:outline-none"
                                >
                                  Mark all as read
                                </button>
                              )}
                            </div>
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-gray-400 text-center text-base">No notifications</div>
                            ) : notifications.map((n, idx) => (
                              <React.Fragment key={n._id}>
                                <DropdownMenuItem
                                  className={`flex flex-col items-start gap-1 px-4 py-3 transition-all cursor-pointer rounded-xl mb-1 ${!n.read ? 'bg-gradient-to-r from-blue-100 via-blue-50 to-white border-l-4 border-blue-400 shadow-md' : 'hover:bg-gray-50'} group`}
                                  onClick={() => { if (!n.read) markAsRead(n._id); if (n.link) navigate(n.link); }}
                                  data-lov-id={n._id}
                                >
                                  <div className="flex items-center w-full">
                                    {!n.read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse shadow-md"></span>}
                                    <span className={`font-medium text-gray-900 text-sm flex-1 ${!n.read ? 'font-bold' : ''}`}>{n.message}</span>
                                  </div>
                                  <span className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</span>
                                </DropdownMenuItem>
                                {idx < notifications.length - 1 && <div className="border-b border-gray-100 mx-4" />}
                              </React.Fragment>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* User Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.profilePicture || "/placeholder.svg?height=32&width=32"} />
                                <AvatarFallback>{user?.name ? user.name[0] : 'E'}</AvatarFallback>
                              </Avatar>
                              <div className="ml-2 text-left">
                                <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                              </div>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-lg border-0 p-2 mt-2">
                            <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-4 py-3 text-gray-800 font-semibold hover:bg-gradient-to-r hover:from-teal-100 hover:to-emerald-100 hover:text-teal-900 transition-all mb-1">
                              Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={logout} className="rounded-xl px-4 py-3 text-red-600 font-semibold hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:text-red-800 transition-all">
                              Logout
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                    Welcome back, {user?.name ? user.name.split(' ')[0] : 'Editor'}!
                  </span>
                </h2>
                <p className="text-gray-600">Find projects to work on.</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Projects Done</p>
                        <p className="text-2xl font-bold text-gray-900">{projectsDone}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{avgProjectRating}</p>
                      </div>
                      <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
                      </div>
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Jobs and Projects Section */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Tabs for Jobs and My Projects */}
                  <Tabs defaultValue="available" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 via-white to-emerald-100 shadow border-0 rounded-2xl mb-4">
                      <TabsTrigger value="available" className="text-blue-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white rounded-xl transition-all">Available Jobs</TabsTrigger>
                      <TabsTrigger value="my-projects" className="text-emerald-700 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-400 data-[state=active]:text-white rounded-xl transition-all">My Projects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="available" className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-blue-800 tracking-tight">Available Jobs</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-blue-100 hover:text-blue-900 shadow rounded-xl font-semibold transition-all">Filter</Button>
                          <Button variant="outline" size="sm" className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100 hover:text-emerald-900 shadow rounded-xl font-semibold transition-all">Sort</Button>
                        </div>
                      </div>

                      {loadingJobs ? (
                        <div className="text-center py-8">Loading jobs...</div>
                      ) : errorJobs ? (
                        <div className="text-center text-red-500 py-8">Error: {errorJobs}</div>
                      ) : (
                        availableJobs.length === 0 ? (
                          <div className="text-center text-gray-500 py-8 text-lg font-medium">No jobs at this time.</div>
                        ) : (
                          availableJobs.map((job) => (
                            <Card key={job._id} className="hover:shadow-xl transition-shadow bg-white/90 border-0 rounded-2xl">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                                      <Badge className={getIndustryColor(job.industry)}>
                                        {job.industry}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                      <span>By {job.owner?.name || job.client || 'N/A'}</span>
                                      <span>•</span><span className="font-bold text-green-700">Price: ₹{typeof job.totalPrice === 'number' ? job.totalPrice : 'N/A'}</span>
                                      {job.budget && <><span>•</span><span>Budget: ₹{job.budget}</span></>}
                                      {job.deadline && <><span>•</span><span>Deadline: {job.deadline}</span></>}
                                      {job.industry && <><span>•</span><span>Industry: {job.industry}</span></>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">{job.budget}</p>
                                    <p className="text-sm text-gray-500">Deadline: {job.deadline}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-all duration-300 hover:scale-105"
                                    onClick={async () => {
                                      const fullProject = await apiClient.getProject(job._id);
                                      setDetailsData(fullProject);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  <Button className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600" onClick={() => handleAcceptProject(job)}>
                                    Accept Project
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )
                      )}
                    </TabsContent>

                    <TabsContent value="my-projects" className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-emerald-800 tracking-tight">My Projects</h3>
                      </div>

                      {loadingProjects ? (
                        <div className="text-center py-8">Loading projects...</div>
                      ) : errorProjects ? (
                        <div className="text-center text-red-500 py-8">Error: {errorProjects}</div>
                      ) : (
                        myProjects.map((project) => (
                          <Card key={project._id} className="hover:shadow-xl transition-shadow bg-white/90 border-0 rounded-2xl">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                  <p className="text-gray-600">Client: {project.owner?.name || project.client || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">{project.earnings}</p>
                                  {project.status === 'completed' && project.finalFile?.uploadedAt && (
                                    <CheckCircle className="inline-block h-6 w-6 text-green-500 ml-2 align-middle animate-bounce" />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                {project.status === 'delivered' ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Delivered {project.deliveredAt}
                                  </Badge>
                                ) : project.status === 'completed' ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Completed {project.deliveredAt}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Due in {project.deadline}
                                  </Badge>
                                )}
                                
                                <div className="space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewProject(project._id)}
                                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300 transition-all duration-300 hover:scale-105"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/project/${project._id}`)}
                                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  >
                                    💬 Chat
                                  </Button>
                                  {project.status === 'in-progress' && (
                                    <Button size="sm" className="bg-gradient-to-r from-teal-600 to-orange-500" onClick={() => handleUploadClick(project._id)}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </Button>
                                  )}
                                  {project.status === 'completed' && Array.isArray(project.collaborators) && project.collaborators.some((c: any) => c.user === user._id || c.user?._id === user._id) && (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700" 
                                      onClick={async () => {
                                        try {
                                          await apiClient.deliverProject(project._id);
                                          toast({ title: 'Project marked as delivered!', variant: 'success' });
                                          // Refresh all data to update stats
                                          refreshAllData();
                                        } catch (err: any) {
                                          toast({ title: 'Failed to mark as delivered', description: err.message, variant: 'destructive' });
                                        }
                                      }}
                                    >
                                      ✓ Mark Delivered
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Raw Files Section for My Projects */}
                              {project.rawFiles && project.rawFiles.length > 0 && (
                                <div className="mt-4">
                                  <div className="font-semibold mb-2 text-sm text-gray-700">Raw Files</div>
                                  <div className="flex flex-wrap gap-4">
                                    {project.rawFiles.map((file: any) => (
                                      <div key={file.public_id || file.filename} className="border rounded p-2 bg-gray-50">
                                        {file.resource_type && file.resource_type.startsWith('video') ? (
                                          <video src={file.url} controls width={120} />
                                        ) : (
                                          <img src={file.url} alt={file.originalname} width={60} />
                                        )}
                                        <div className="text-xs mt-1 break-all">{file.originalname || file.filename}</div>
                                        <a href={file.url} download className="text-blue-600 underline text-xs">Download</a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4">
                                <div className="flex flex-col gap-1 text-sm">
                                  <span><b>Total Price:</b> ₹{project.totalPrice || project.price || 'N/A'}</span>
                                  <span><b>Your Earnings (80%):</b> ₹{project.totalPrice ? Math.round(project.totalPrice * 0.8) : project.price ? Math.round(project.price * 0.8) : 'N/A'}</span>
                                  <span className="text-xs text-gray-500"><b>Company Commission (20%):</b> ₹{project.totalPrice ? Math.round(project.totalPrice * 0.2) : project.price ? Math.round(project.price * 0.2) : 'N/A'}</span>
                                </div>
                                {/* Advanced Features */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {project.transitions && <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Transitions</span>}
                                  {project.textOverlays && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Text Overlays</span>}
                                  {project.colorGrading && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Color Grading</span>}
                                  {project.multipleClips && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Multiple Clips</span>}
                                  {project.aspectRatioOptimization && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Aspect Ratio</span>}
                                  {project.soundDesign && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Sound Design</span>}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Tools */}
                  <Card className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 shadow-xl border-0 rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-400" /> Quick Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-blue-100 hover:text-blue-900 shadow-sm rounded-xl font-semibold transition-all" variant="outline" onClick={handleVideoEditor}>
                        <Play className="h-4 w-4 mr-2 text-blue-500" />
                        Video Editor
                      </Button>
                      <Button className="w-full justify-start bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100 hover:text-emerald-900 shadow-sm rounded-xl font-semibold transition-all" variant="outline" onClick={handleUploadPortfolio}>
                        <Upload className="h-4 w-4 mr-2 text-emerald-500" />
                        Upload Portfolio
                      </Button>
                      <Button className="w-full justify-start bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200 hover:from-yellow-200 hover:to-yellow-100 hover:text-yellow-900 shadow-sm rounded-xl font-semibold transition-all" variant="outline" onClick={handlePaymentHistory}>
                        <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                        Payment History
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Tips */}
                  <Card className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 shadow-xl border-0 rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-orange-700 flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-orange-400" /> Tips for Success
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-base text-gray-700 font-medium pl-2">
                        <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Respond to job offers quickly</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span>Upload high-quality portfolio samples</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span>Communicate clearly with clients</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-400 rounded-full"></span>Deliver on time to build reputation</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl p-0 bg-white/95 rounded-2xl shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-100 to-emerald-100 rounded-t-2xl p-6">
              <DialogTitle className="text-2xl font-bold text-blue-900">Project Details</DialogTitle>
              <DialogDescription className="text-gray-600">View all details for this project.</DialogDescription>
            </DialogHeader>
            {detailsData && (
              <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                <div className="text-lg font-semibold text-gray-800 mb-2">{detailsData.title || 'N/A'}</div>
                <div className="text-gray-700 mb-2">{detailsData.description || 'N/A'}</div>
                <div className="flex flex-wrap gap-4 mb-2">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">Client: {detailsData.owner?.name || detailsData.client || 'N/A'}</span>
                  {detailsData.totalPrice && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Price: ₹{detailsData.totalPrice}</span>}
                  {detailsData.budget && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Budget: ₹{detailsData.budget}</span>}
                  {detailsData.deadline && <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">Deadline: {detailsData.deadline}</span>}
                  {detailsData.industry && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">Industry: {detailsData.industry}</span>}
                </div>
                <div className="mb-2 text-sm text-gray-600"><b>Materials:</b> {detailsData.materials || 'N/A'}</div>
                {/* Shop Details */}
                {detailsData.shopDetails && (detailsData.shopDetails.name || detailsData.shopDetails.tagline || detailsData.shopDetails.address || detailsData.shopDetails.offer) ? (
                  <div className="p-3 bg-gray-50 rounded-xl mb-2">
                    <div><b>Shop Name:</b> {detailsData.shopDetails.name || 'N/A'}</div>
                    <div><b>Tagline:</b> {detailsData.shopDetails.tagline || 'N/A'}</div>
                    <div><b>Address:</b> {detailsData.shopDetails.address || 'N/A'}</div>
                    <div><b>Offer:</b> {detailsData.shopDetails.offer || 'N/A'}</div>
                  </div>
                ) : null}
                {/* Add-ons */}
                {detailsData.addons && (detailsData.addons.voiceover || detailsData.addons.script || detailsData.addons.subtitles) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {detailsData.addons.voiceover && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Voiceover</span>}
                    {detailsData.addons.script && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Script Writing</span>}
                    {detailsData.addons.subtitles && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Subtitles</span>}
              </div>
            )}
                {/* Advanced Features */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {detailsData.transitions && <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Transitions</span>}
                  {detailsData.textOverlays && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Text Overlays</span>}
                  {detailsData.colorGrading && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Color Grading</span>}
                  {detailsData.multipleClips && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Multiple Clips</span>}
                  {detailsData.aspectRatioOptimization && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Aspect Ratio</span>}
                  {detailsData.soundDesign && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Sound Design</span>}
                </div>
                {/* Tags */}
                {detailsData.tags && detailsData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {detailsData.tags.map((tag: string, idx: number) => <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">{tag}</span>)}
                  </div>
                )}
                {/* Raw Files Section */}
                {detailsData.rawFiles && detailsData.rawFiles.length > 0 && (
                  <div className="mt-2">
                    <b>Raw Files:</b>
                    <ul className="list-disc ml-6">
                      {detailsData.rawFiles.map((file: any, idx: number) => (
                        <li key={file.public_id || idx} className="mb-1">
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {file.originalname || file.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="p-4">
              <Button onClick={() => setDetailsOpen(false)} variant="outline" className="rounded-xl">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Modal */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Final Video</DialogTitle>
              <DialogDescription>Upload the final edited video for this project. Only video files are allowed. Max size: 100MB.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <label htmlFor="final-video-upload" className="block w-full border-2 border-dashed border-blue-400 rounded-lg p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all">
                <span className="text-blue-700 font-semibold">Click or drag a video file here to upload</span>
              <input
                  id="final-video-upload"
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
                  className="hidden"
              />
              </label>
              {finalVideoFile && (
                <div className="text-sm text-gray-700 text-center">Selected: <span className="font-medium">{finalVideoFile.name}</span></div>
              )}
              {uploading && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <Progress value={uploadProgress} className="w-full mb-1 h-4 bg-blue-100 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </Progress>
                  <div className="text-base font-bold text-blue-800 tracking-wide drop-shadow-sm animate-pulse">Uploading: {uploadProgress}%</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadModalOpen(false)} disabled={uploading}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl p-0 rounded-2xl shadow-2xl border-0 bg-white/90">
            <div className="max-h-[80vh] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
              <DialogDescription>
                Preview all project data, raw files, and final file for this project.
              </DialogDescription>
            </DialogHeader>
            {viewProject && (
              <div className="space-y-6">
                {/* Basic Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>Title:</strong> {viewProject.title}</div>
                  <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                    viewProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                    viewProject.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    viewProject.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{viewProject.status}</span></div>
                  <div><strong>Owner:</strong> {viewProject.owner?.name || viewProject.owner}</div>
                  <div><strong>Category:</strong> {viewProject.category}</div>
                  <div><strong>Created:</strong> {new Date(viewProject.createdAt).toLocaleDateString()}</div>
                  <div><strong>Updated:</strong> {new Date(viewProject.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div><strong>Description:</strong> {viewProject.description}</div>
                
                {/* Shop Details */}
                {viewProject.shopDetails && (viewProject.shopDetails.name || viewProject.shopDetails.tagline || viewProject.shopDetails.address || viewProject.shopDetails.offer) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Shop Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewProject.shopDetails.name && <div><b>Shop Name:</b> {viewProject.shopDetails.name}</div>}
                      {viewProject.shopDetails.tagline && <div><b>Tagline:</b> {viewProject.shopDetails.tagline}</div>}
                      {viewProject.shopDetails.address && <div><b>Address:</b> {viewProject.shopDetails.address}</div>}
                      {viewProject.shopDetails.offer && <div><b>Offer:</b> {viewProject.shopDetails.offer}</div>}
                    </div>
                  </div>
                )}
                
                {/* Add-ons */}
                {viewProject.addons && (viewProject.addons.voiceover || viewProject.addons.script || viewProject.addons.subtitles) && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Add-ons</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewProject.addons.voiceover && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Voiceover</span>}
                      {viewProject.addons.script && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Script Writing</span>}
                      {viewProject.addons.subtitles && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Subtitles</span>}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {viewProject.tags && viewProject.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewProject.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Raw Files Section */}
                {viewProject.rawFiles && viewProject.rawFiles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800">Raw Files ({viewProject.rawFiles.length})</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {viewProject.rawFiles.map((file: any, index: number) => (
                          <div key={file.public_id || index} className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition-all flex flex-col items-center">
                            <div className="flex justify-center mb-2 w-full">
                            {file.resource_type && file.resource_type.startsWith('video') ? (
                              <video 
                                src={file.url} 
                                controls 
                                  className="w-full h-32 object-cover rounded mb-2 bg-black"
                                onError={(e) => {
                                  console.error('Video load error:', e);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <img 
                                src={file.url} 
                                alt={file.originalname || 'Raw file'} 
                                  className="w-full h-32 object-cover rounded mb-2 bg-gray-100"
                                onError={(e) => {
                                  console.error('Image load error:', e);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                            <div className="text-sm font-medium text-gray-900 mb-1 truncate w-full text-center">
                            {file.originalname || `File ${index + 1}`}
                          </div>
                            <div className="flex gap-2 w-full justify-center mt-2">
                            <a 
                              href={file.url} 
                              download 
                                className="flex-1 bg-blue-600 text-white text-xs py-1 px-2 rounded text-center hover:bg-blue-700 transition-colors font-semibold"
                            >
                              Download
                            </a>
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                                className="flex-1 bg-gray-600 text-white text-xs py-1 px-2 rounded text-center hover:bg-gray-700 transition-colors font-semibold"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Final File Section */}
                {viewProject.finalFile && viewProject.finalFile.url && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800">Final Edited File</h3>
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 shadow-sm">
                      <div className="flex justify-center mb-3">
                        {viewProject.finalFile.resource_type && viewProject.finalFile.resource_type.startsWith('video') ? (
                          <video 
                            src={viewProject.finalFile.url} 
                            controls 
                            className="max-w-full h-48 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              console.error('Final video load error:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <img 
                            src={viewProject.finalFile.url} 
                            alt={viewProject.finalFile.originalname || 'Final file'} 
                            className="max-w-full h-48 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              console.error('Final image load error:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-base font-semibold text-gray-900 mb-2">
                          {viewProject.finalFile.originalname || 'Final File'}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {viewProject.finalFile.size ? `${(viewProject.finalFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                          {viewProject.finalFile.uploadedAt && (
                            <span className="ml-2">• Uploaded: {new Date(viewProject.finalFile.uploadedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex gap-2 justify-center">
                          <a 
                            href={viewProject.finalFile.url} 
                            download 
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                          >
                            Download Final
                          </a>
                          <a 
                            href={viewProject.finalFile.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            View Online
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};


export default EditorDashboard;
