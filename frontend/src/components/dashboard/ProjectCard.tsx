import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Clock, CheckCircle, Star, Eye, Download, RefreshCcw, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

interface Project {
  _id: string;
  title: string;
  status: string;
  owner?: { _id: string };
  editor?: string;
  rating?: number;
  deliveredAt?: string;
  progress?: number;
  estimatedDelivery?: string;
  requestedAt?: string;
  thumbnail?: string;
  finalVideoFile?: { filename?: string; uploadedAt?: string };
  reeditRequests?: { status: string }[];
  reviews?: Array<{ user: string; rating: number; comment?: string }>;
  collaborators?: Array<{ user: string; role: string }>;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  user?: any;
  onDelete?: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
  onRatingUpdate?: () => void;
}

const ProjectCard = ({ project, index, user, onDelete, onEdit, onRatingUpdate }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Check if user has already rated this project
  const hasUserRated = project.reviews?.some(review => review.user === user?._id);
  const existingRating = project.reviews?.find(review => review.user === user?._id)?.rating || 0;
  
  // Hide rating form if user has already rated
  useEffect(() => {
    if (hasUserRated && showRatingForm) {
      setShowRatingForm(false);
    }
  }, [hasUserRated, showRatingForm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };

  // Helper to check if re-edit can be requested
  const canRequestReedit = () => {
    if (!project.finalVideoFile || !project.finalVideoFile.uploadedAt) return false;
    const deliveredAt = new Date(project.finalVideoFile.uploadedAt);
    const now = new Date();
    const hoursSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDelivery > 72) return false;
    if (project.reeditRequests && project.reeditRequests.some(r => r.status === 'pending')) return false;
    return true;
  };

  // Helper to show re-edit status
  const reeditStatus = () => {
    if (!project.reeditRequests || project.reeditRequests.length === 0) return null;
    const latest = project.reeditRequests[project.reeditRequests.length - 1];
    if (latest.status === 'pending') return 'Re-edit requested (pending)';
    if (latest.status === 'approved') return 'Re-edit approved';
    if (latest.status === 'rejected') return 'Re-edit rejected';
    return null;
  };

  // Helper to check if project has an editor assigned
  const hasEditorAssigned = () => {
    return project.collaborators && project.collaborators.some(collab => collab.role === 'editor');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.finalVideoFile && project.finalVideoFile.filename) {
      window.open(`/uploads/${project.finalVideoFile.filename}`, '_blank');
    }
  };

  const handleRequestReedit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = window.prompt('Enter reason for re-edit request (optional):') || '';
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/reedit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Re-edit request submitted!', variant: 'success' });
      window.location.reload();
    } catch (err) {
      toast({ title: 'Failed to request re-edit', description: err.message, variant: 'destructive' });
    }
  };

  const handleSubmitRating = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    
    setSubmittingRating(true);
    try {
      console.log('Submitting rating:', { rating, comment, projectId: project._id });
      
      const res = await fetch(`${API_BASE_URL}/projects/${project._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Rating submission error:', error);
        throw new Error(error.message || 'Failed to submit rating');
      }
      
      const result = await res.json();
      console.log('Rating submission success:', result);
      
      toast({ title: 'Rating submitted successfully!', variant: 'success' });
      setShowRatingForm(false);
      setRating(0);
      setComment('');
      // Refresh project data to update the UI
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (err: any) {
      console.error('Rating submission failed:', err);
      
      // Handle specific error cases
      if (err.message.includes('already reviewed')) {
        toast({ 
          title: 'Already Rated', 
          description: 'You have already rated this project. The rating form will be hidden.', 
          variant: 'default' 
        });
        setShowRatingForm(false);
        // Refresh project data to update the UI
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      } else {
        toast({ title: 'Failed to submit rating', description: err.message, variant: 'destructive' });
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderRatingStars = (ratingValue: number, interactive = false, onStarClick?: (star: number) => void, onStarHover?: (star: number) => void) => {
    return (
      <div className="flex items-center space-x-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            id={`rating-star-${star}`}
            name="rating"
            value={star}
            className={`h-4 w-4 cursor-pointer transition-all duration-200 ${
              star <= ratingValue
                ? 'text-amber-400 fill-current'
                : 'text-gray-300 hover:text-amber-300'
            } ${interactive ? 'hover:scale-125' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (interactive && onStarClick) {
                onStarClick(star);
              }
            }}
            onMouseEnter={() => interactive && onStarHover?.(star)}
            onMouseLeave={() => interactive && onStarHover?.(0)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={star <= ratingValue}
          >
            <Star className="h-4 w-4" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card 
      key={project._id} 
      className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-200 animate-fade-in cursor-pointer" 
      style={{animationDelay: `${index * 0.1}s`}}
      onClick={(e) => {
        // Prevent navigation if clicking delete or edit button
        if ((e.target as HTMLElement).closest('button')) return;
        navigate(`/project/${project._id}`);
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300">{project.title}</h4>
          <Badge className={`${getStatusColor(project.status)} hover:scale-105 transition-transform duration-300`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status.replace('-', '')}</span>
            </div>
          </Badge>
          {/* Delete button for owner */}
          {user && project.owner && (user._id === project.owner._id) && onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="ml-4 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-300 transition-all duration-300 hover:scale-105"
              onClick={e => { e.stopPropagation(); onDelete(project._id); }}
            >
              Delete
            </Button>
          )}
          {/* Edit button for owner */}
          {user && project.owner && (user._id === project.owner._id) && onEdit && project.status !== 'completed' && project.status !== 'delivered' && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-all duration-300 hover:scale-105"
              onClick={e => { e.stopPropagation(); onEdit(project._id); }}
            >
              Edit
            </Button>
          )}
        </div>

        {project.status === 'in-progress' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-semibold text-blue-600">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3 bg-blue-100" />
            <p className="text-sm text-gray-500 mt-2">
              Editor: <span className="font-medium text-blue-600">{project.editor}</span> • Estimated Delivery: <span className="font-medium text-emerald-600">{project.estimatedDelivery}</span>
            </p>
            {/* Chat button for in-progress projects with editor */}
            {hasEditorAssigned() && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate(`/project/${project._id}#chat`); 
                  }}
                >
                  💬 Chat
                </Button>
              </div>
            )}
          </div>
        )}

        {(project.status === 'completed' || project.status === 'delivered') && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              {/* Rating Display or Input */}
              {hasUserRated ? (
                <div className="flex items-center space-x-2" role="group" aria-label="Your rating">
                  {renderRatingStars(existingRating)}
                  <span className="text-sm text-gray-600">Your rating</span>
                </div>
              ) : showRatingForm && !hasUserRated ? (
                <form 
                  className="space-y-2" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (rating > 0) {
                      handleSubmitRating(e);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-2">
                    {renderRatingStars(
                      hoverRating || rating,
                      true,
                      setRating,
                      setHoverRating
                    )}
                    <span className="text-sm text-gray-600">
                      {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Rate this project'}
                    </span>
                  </div>
                  <textarea
                    id="rating-comment"
                    name="rating-comment"
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none"
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingRating || rating === 0}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        setShowRatingForm(false); 
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    if (!hasUserRated) {
                      setShowRatingForm(true); 
                    }
                  }}
                  className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  disabled={hasUserRated}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {hasUserRated ? 'Already Rated' : 'Rate this project'}
                </Button>
              )}
              
              <p className="text-sm text-gray-600">
                By <span className="font-medium text-emerald-600">{project.editor}</span> • {project.deliveredAt}
              </p>
              {reeditStatus() && (
                <span className="text-xs text-blue-500 font-medium">{reeditStatus()}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {project.finalVideoFile && project.finalVideoFile.filename && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:border-green-300 bg-green-50 text-green-700 border-green-200 transition-all duration-300 hover:scale-105"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {canRequestReedit() && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 transition-all duration-300 hover:scale-105"
                  onClick={handleRequestReedit}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Request Re-edit
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 hover:border-indigo-300 transition-all duration-300 hover:scale-105"
                onClick={(e) => { e.stopPropagation(); navigate(`/project/${project._id}`); }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              {/* Chat button for completed/delivered projects with editor */}
              {hasEditorAssigned() && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate(`/project/${project._id}#chat`); 
                  }}
                >
                  💬 Chat
                </Button>
              )}
            </div>
          </div>
        )}

        {project.status === 'pending' && (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Requested <span className="font-medium text-amber-600">{project.requestedAt}</span> • Waiting for editor assignment
            </p>
            {/* Chat button for pending projects with editor (in case editor was assigned but status not updated) */}
            {hasEditorAssigned() && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate(`/project/${project._id}#chat`); 
                }}
              >
                💬 Chat
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
