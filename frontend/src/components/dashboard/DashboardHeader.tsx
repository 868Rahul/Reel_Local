import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Bell, Camera } from "lucide-react";
import { apiClient, API_BASE_URL } from '@/api/api';
import React from "react";

function setGoogleTranslate(lang) {
  const select = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  }
}

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  // Remove the language selector dropdown and related state/logic

  useEffect(() => {
    // setGoogleTranslate(selectedLang); // This line is removed
  }, []); // This useEffect is also removed

  useEffect(() => {
    if (!user) return;
    apiClient.getNotifications()
      .then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter((n: any) => !n.read).length);
      });
  }, [user, open]);

  const markAsRead = async (id: string) => {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    await Promise.all(unreadIds.map(id => fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 animate-fade-in group cursor-pointer">
            <span className="rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
              <Camera className="w-8 h-8 text-white transition-all duration-300" />
            </span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent ml-2">
              ReelLocal
            </h1>
            <Badge className="ml-4 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border-teal-200 animate-pulse">{'Business'}</Badge>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            {/* End Language Selector Dropdown */}
            {user && (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="relative focus:outline-none">
                    <Bell className="h-6 w-6 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-400 text-white text-xs rounded-full px-2 py-0.5 shadow-lg animate-bounce border-2 border-white">{unreadCount}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl bg-gradient-to-br from-white/90 via-blue-50 to-emerald-50 backdrop-blur-lg border border-gray-200 p-0">
                  <div className="flex items-center justify-between font-semibold px-4 py-3 border-b text-gray-800 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
                    <span>{'Notifications'}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg shadow-sm border border-blue-200 transition-all duration-200 hover:scale-105 focus:outline-none"
                      >
                        {'Mark all as read'}
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-gray-400 text-center text-base">{'No notifications'}</div>
                  ) : (
                    notifications.map((n, idx) => (
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
                        {idx < notifications.length - 1 && <div className="border-b border-gray-100 mx-4" key={`divider-${n._id}`} />}
                      </React.Fragment>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePicture || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left">
                      <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-lg border-0 p-2 mt-2">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-4 py-3 text-gray-800 font-semibold hover:bg-gradient-to-r hover:from-teal-100 hover:to-emerald-100 hover:text-teal-900 transition-all mb-1">
                    {'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="rounded-xl px-4 py-3 text-red-600 font-semibold hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:text-red-800 transition-all">
                    {'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost">{'Profile'}</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;