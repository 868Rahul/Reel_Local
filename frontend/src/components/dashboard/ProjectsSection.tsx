import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Project } from "@/api/api";
import ProjectCard from "./ProjectCard";
// import { useLanguage } from '@/contexts/LanguageContext'; // Removed

const ProjectsSection = () => {
  const navigate = useNavigate();
  const { refreshStats, user } = useAuth();
  // const { t } = useLanguage(); // Removed
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects();
      setProjects(response.projects || []);
      setError(null);
      // Refresh stats when projects are loaded
      await refreshStats();
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = (status: string) => {
    if (status === 'all') return projects;
    return projects.filter(project => project.status === status);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.deleteProject(projectId);
      await fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleEdit = (projectId: string) => {
    navigate(`/project/${projectId}/edit`);
  };

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">Your Projects</h3>
        <Button 
          className="bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 hover:from-teal-700 hover:via-emerald-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
          onClick={() => navigate('/upload')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="in-progress"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white transition-all duration-300"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProjects} variant="outline">
                Try Again
              </Button>
            </div>
          ) : getFilteredProjects('all').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No projects found</p>
              <Button 
                className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600"
                onClick={() => navigate('/upload')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            </div>
          ) : (
            getFilteredProjects('all').map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} user={user} onDelete={handleDelete} onEdit={handleEdit} onRatingUpdate={fetchProjects} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {getFilteredProjects('in-progress').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No projects in progress</p>
            </div>
          ) : (
            getFilteredProjects('in-progress').map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} user={user} onRatingUpdate={fetchProjects} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getFilteredProjects('completed').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No completed projects</p>
            </div>
          ) : (
            getFilteredProjects('completed').map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} user={user} onRatingUpdate={fetchProjects} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsSection;
