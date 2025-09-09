import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  { key: 'quick_buzz', name: 'Quick Buzz', features: ['Standard edit', 'Music'], price: 499 },
  { key: 'smooth_flow', name: 'Smooth Flow', features: ['Standard edit', 'Music'], price: 799 },
  { key: 'full_impact', name: 'Full Impact', features: ['Transitions', 'Polish'], price: 999 },
  { key: 'master_reel', name: 'Master Reel', features: ['Custom editing', 'Text overlays', 'Sound design', 'Captions', 'Multiple clips', 'Color grading', 'Smooth transitions', 'Social media aspect ratio'], price: 1999 },
];
const addonOptions = [
  { key: 'captions', label: 'Captions/Subtitles', price: 49 },
  { key: 'trending_audio', label: 'Trending Audio Sync', price: 29 },
  { key: 'logo_animation', label: 'Logo Animation', price: 259 },
];

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    apiClient.getProject(id)
      .then((data) => {
        setProject(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
      })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      // Update project basic info first
      await apiClient.updateProject(id, {
        title,
        description,
        category,
      });
      
      // Upload files separately if they exist
      if (videoFile) {
        await apiClient.uploadVideo(id, videoFile);
      }
      if (thumbnailFile) {
        await apiClient.uploadThumbnail(id, thumbnailFile);
      }
      
      alert("Project updated successfully!");
      navigate('/business-dashboard');
    } catch (err) {
      console.error('Update error:', err);
      alert("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button variant="outline" className="rounded-xl border-teal-200 bg-white/80 hover:bg-teal-50 shadow" onClick={() => navigate('/business-dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-teal-100 to-orange-100 rounded-t-3xl p-8 pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">Edit Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-12 text-lg rounded-xl focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="h-28 text-lg rounded-xl focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Category</label>
            <Input value={category} onChange={e => setCategory(e.target.value)} className="h-12 text-lg rounded-xl focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Video File</label>
            <input type="file" accept="video/*" ref={fileInputRef} onChange={e => setVideoFile(e.target.files?.[0] || null)} className="block w-full text-base rounded-xl border border-gray-200 p-2" />
            {project?.videoFile?.filename && (
              <div className="text-xs text-gray-500 mt-1">Current: {project.videoFile.originalName}</div>
            )}
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Thumbnail File</label>
            <input type="file" accept="image/*" ref={thumbInputRef} onChange={e => setThumbnailFile(e.target.files?.[0] || null)} className="block w-full text-base rounded-xl border border-gray-200 p-2" />
            {project?.thumbnailFile?.filename && (
              <div className="text-xs text-gray-500 mt-1">Current: {project.thumbnailFile.originalName}</div>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-teal-500 to-orange-400 hover:from-teal-600 hover:to-orange-500 shadow-lg hover:shadow-xl transition-all duration-200">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEdit; 