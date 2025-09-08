import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
      <div className="absolute top-4 right-4">
        {/* <LanguageSelector /> */}
      </div>
      <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-teal-600 to-orange-500 text-white px-6 py-2 rounded">
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
