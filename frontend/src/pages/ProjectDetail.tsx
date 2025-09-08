import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
// import LanguageSelector from '@/components/LanguageSelector'; // Removed
// import { useLanguage } from '@/contexts/LanguageContext'; // Removed

interface Message {
  _id: string;
  sender: any;
  recipient: any;
  text: string;
  type: string;
  timestamp: string;
  file?: {
    filename: string;
    originalName?: string;
    url?: string;
  };
}

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  // const { t } = useLanguage(); // Removed

  useEffect(() => {
    fetchProject();
    fetchMessages();
    // Connect to Socket.IO
    const sock = io('http://localhost:5000');
    setSocket(sock);
    
    sock.on('connect', () => {
      console.log('Socket connected');
    sock.emit('joinProject', id);
    });
    
    sock.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    sock.on('newMessage', (msg: any) => {
      console.log('Received new message:', msg);
      setMessages((prev) => [...prev, msg]);
    });
    
    sock.on('typing', (typingUserObj: any) => {
      if (typingUserObj && typingUserObj._id !== user._id) setTypingUser(typingUserObj.name || 'Someone');
      setTimeout(() => setTypingUser(null), 2000);
    });
    
    // Fetch payments
    fetchPayments();
    return () => {
      sock.disconnect();
    };
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle hash navigation to chat section
  useEffect(() => {
    if (location.hash === '#chat' && chatSectionRef.current) {
      setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Small delay to ensure content is loaded
    }
  }, [location.hash]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getProject(id!);
      setProject(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/payments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPayments(data.payments || []);
    } catch {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !project) return;
    setSending(true);
    try {
      let recipient = null;
      if (user.role === 'business') {
        const editorCollab = project.collaborators?.find((c: any) => c.role === 'editor');
        recipient = editorCollab?.user?._id || editorCollab?.user;
      } else {
        recipient = project.owner?._id || project.owner;
      }
      if (!recipient) {
        alert('No recipient found for this chat.');
        setSending(false);
        return;
      }
      const formData = new FormData();
      formData.append('recipient', recipient);
      if (newMessage.trim()) formData.append('text', newMessage);
      if (file) formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/projects/${id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      console.log('Message sent successfully:', data);
      
      // Add message to local state immediately for instant feedback
      if (data.message) {
        console.log('Adding message to local state:', data.message);
        setMessages((prev) => [...prev, data.message]);
      }
      
      // Emit socket event for other users
      if (socket) {
        console.log('Emitting socket event for project:', id);
        socket.emit('newMessage', id, data.message);
      }
      
      setNewMessage("");
      setFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <div className="text-gray-600 font-medium">Loading project details...</div>
    </div>
  </div>;
  if (!project) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-xl font-semibold mb-2">Project not found</div>
      <div className="text-gray-600">The project you're looking for doesn't exist or has been removed.</div>
    </div>
  </div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-orange-500 bg-clip-text text-transparent">
              Project Details
            </h1>
            <p className="text-gray-600 mt-1">Manage and track your project progress</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = user.role === 'editor' ? '/editor-dashboard' : '/business-dashboard'}
              className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
          Back to Dashboard
        </Button>
        {/* <LanguageSelector /> */}
      </div>
        </div>
        
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-2xl font-bold text-gray-800">{project.title}</CardTitle>
        </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Description</div>
                  <div className="font-medium text-gray-800">{project.description}</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    project.status === 'review' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>{project.status}</span>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Owner</div>
                  <div className="font-medium text-gray-800">{project.owner?.name || project.owner}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-medium text-gray-800">{project.category}</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Created</div>
                  <div className="font-medium text-gray-800">{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Updated</div>
                  <div className="font-medium text-gray-800">{new Date(project.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
          </div>
          
          {/* Shop Details */}
          {project.shopDetails && (project.shopDetails.name || project.shopDetails.tagline || project.shopDetails.address || project.shopDetails.offer) && (
              <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full mr-3"></span>
                  Shop Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.shopDetails.name && (
                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                      <div className="text-sm text-gray-600 mb-1">Shop Name</div>
                      <div className="font-medium text-gray-800">{project.shopDetails.name}</div>
                    </div>
                  )}
                  {project.shopDetails.tagline && (
                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                      <div className="text-sm text-gray-600 mb-1">Tagline</div>
                      <div className="font-medium text-gray-800">{project.shopDetails.tagline}</div>
                    </div>
                  )}
                  {project.shopDetails.address && (
                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div className="font-medium text-gray-800">{project.shopDetails.address}</div>
                    </div>
                  )}
                  {project.shopDetails.offer && (
                    <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                      <div className="text-sm text-gray-600 mb-1">Offer</div>
                      <div className="font-medium text-gray-800">{project.shopDetails.offer}</div>
                    </div>
                  )}
              </div>
            </div>
          )}
          
          {/* Add-ons */}
          {project.addons && (project.addons.voiceover || project.addons.script || project.addons.subtitles) && (
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mr-3"></span>
                  Add-ons
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.addons.voiceover && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-md">
                      Voiceover
                    </span>
                  )}
                  {project.addons.script && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-md">
                      Script Writing
                    </span>
                  )}
                  {project.addons.subtitles && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-md">
                      Subtitles
                    </span>
                  )}
              </div>
            </div>
          )}
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200 shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-gray-400 to-slate-500 rounded-full mr-3"></span>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                {project.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-gray-100 to-slate-200 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                      {tag}
                    </span>
                ))}
              </div>
            </div>
          )}
            
          {/* Raw Files */}
          {project.rawFiles && project.rawFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full mr-3"></span>
                  Raw Files ({project.rawFiles.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.rawFiles.map((file: any, index: number) => (
                    <div key={file.public_id || index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                      <div className="flex justify-center mb-4">
                      {file.resource_type && file.resource_type.startsWith('video') ? (
                        <video 
                          src={file.url} 
                          controls 
                            className="w-full h-40 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            console.error('Video load error:', e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <img 
                          src={file.url} 
                          alt={file.originalname || 'Raw file'} 
                            className="w-full h-40 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                      <div className="text-sm font-semibold text-gray-900 mb-2 truncate">
                      {file.originalname || `File ${index + 1}`}
                    </div>
                      <div className="text-xs text-gray-500 mb-4">
                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={file.url} 
                        download 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs py-2 px-3 rounded-lg text-center hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-md"
                      >
                        Download
                      </a>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                          className="bg-gradient-to-r from-gray-500 to-slate-600 text-white text-xs py-2 px-3 rounded-lg hover:from-gray-600 hover:to-slate-700 transition-all duration-300 font-semibold shadow-md"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Final File */}
          {project.finalFile && project.finalFile.url && (
            <div className="mt-8">
                <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-3"></span>
                  Final Edited File
                </h3>
                <div className="border-0 rounded-3xl p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-green-200">
                  <div className="flex-1 flex justify-center items-center">
                  {project.finalFile.resource_type && project.finalFile.resource_type.startsWith('video') ? (
                    <video 
                      src={project.finalFile.url} 
                      controls 
                        poster={project.thumbnailFile?.url}
                        className="w-full max-w-lg h-80 object-cover rounded-2xl shadow-2xl border-4 border-green-200"
                      onError={(e) => {
                        console.error('Final video load error:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img 
                      src={project.finalFile.url} 
                      alt={project.finalFile.originalname || 'Final file'} 
                        className="w-full max-w-lg h-80 object-cover rounded-2xl shadow-2xl border-4 border-green-200"
                      onError={(e) => {
                        console.error('Final image load error:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                  <div className="flex-1 flex flex-col items-center md:items-start">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                    {project.finalFile.originalname || 'Final File'}
                  </div>
                    <div className="text-sm text-gray-600 mb-6">
                    {project.finalFile.size ? `${(project.finalFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                    {project.finalFile.uploadedAt && (
                      <span className="ml-2">• Uploaded: {new Date(project.finalFile.uploadedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                    <div className="flex gap-4 w-full justify-center md:justify-start">
                    <a 
                      href={project.finalFile.url} 
                      download 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg border-0 transform hover:scale-105"
                    >
                      Download Final
                    </a>
                    <a 
                      href={project.finalFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-8 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg border-0 transform hover:scale-105"
                    >
                      View Online
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
            
          {/* Payment History */}
          {payments.length > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 shadow-lg">
                <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></span>
                  Payment History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-xl overflow-hidden shadow-md">
                <thead>
                      <tr className="bg-gradient-to-r from-yellow-100 to-orange-100">
                        <th className="p-3 text-left font-semibold text-gray-700">Order ID</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Payment ID</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Amount</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3">{p.orderId}</td>
                          <td className="p-3">{p.paymentId}</td>
                          <td className="p-3 font-semibold text-green-600">₹{p.amount}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3">{new Date(p.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
            </div>
          )}
            
          {/* Delivery Deadline */}
          {payments.some(p => p.status === 'paid') && project.estimatedDelivery && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                  <span className="text-green-800 font-semibold">Delivery Deadline: {project.estimatedDelivery}</span>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
        
        <Card ref={chatSectionRef} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
            <CardTitle className="text-xl font-bold text-gray-800">Project Chat</CardTitle>
        </CardHeader>
          <CardContent className="p-6">
            <div className="h-80 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 mb-6 border border-gray-200 shadow-inner">
            {messages.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <div>No messages yet. Start the conversation!</div>
                </div>
            ) : (
              messages.map((msg) => (
                  <div key={msg._id} className={`mb-3 flex ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 max-w-xs break-words shadow-md ${
                      msg.sender?._id === user._id 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className={`text-xs mb-1 font-semibold ${msg.sender?._id === user._id ? 'text-teal-100' : 'text-gray-500'}`}>
                        {msg.sender?.name || 'You'}
                      </div>
                    {msg.type === 'file' && msg.file ? (
                      <a
                          href={msg.file.url ? msg.file.url : `/uploads/chat/${msg.file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                          className={`underline break-all hover:opacity-80 ${msg.sender?._id === user._id ? 'text-teal-100' : 'text-blue-600'}`}
                      >
                        {msg.file.originalName || msg.file.filename}
                      </a>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                      <div className={`text-[10px] mt-1 ${msg.sender?._id === user._id ? 'text-teal-100' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
            <form onSubmit={handleSend} className="flex gap-3 items-center">
              <label className="cursor-pointer flex items-center bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
              <input
                type="file"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
                disabled={sending}
              />
                <Paperclip className={`h-5 w-5 ${file ? 'text-teal-600' : 'text-gray-500'}`} />
                {file && <span className="text-xs text-gray-600 ml-2">{file.name}</span>}
            </label>
            <input
              type="text"
                className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => {
                setNewMessage(e.target.value);
                if (socket) socket.emit('typing', id, user);
              }}
              disabled={sending}
            />
              <Button 
                type="submit" 
                disabled={sending || (!newMessage.trim() && !file)} 
                className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 text-white rounded-2xl px-6 py-3 font-semibold shadow-lg border-0 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </Button>
          </form>
          {typingUser && (
              <div className="text-xs text-gray-500 mt-3 flex items-center">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                {typingUser} is typing...
              </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ProjectDetail; 