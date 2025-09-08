import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Upload, Star, Clock, Users, CheckCircle, Briefcase, Video, HelpCircle, Mail, FileText, Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getTestimonials, getStats } from "@/lib/api";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const Index = () => {
  const navigate = useNavigate();
  const [activeUserType, setActiveUserType] = useState<'business' | 'editor'>('business');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorTestimonials, setErrorTestimonials] = useState<string | null>(null);
  // const { t } = useLanguage(); // Removed

  useEffect(() => {
    getStats()
      .then((data) => {
        setStats(data);
        setErrorStats(null);
      })
      .catch(() => setErrorStats('Failed to load stats'))
      .finally(() => setLoadingStats(false));
    getTestimonials()
      .then((data) => {
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        } else {
          setTestimonials([
            {
              name: "Priya Sharma",
              content: "ReelLocal made our video marketing effortless. The editors are top-notch and delivery is always on time!",
              rating: 5
            },
            {
              name: "Rahul Verma",
              content: "Superb experience! The quality of work and professionalism exceeded our expectations.",
              rating: 5
            },
            {
              name: "Ananya Singh",
              content: "I loved the quick turnaround and the creative edits. Highly recommended for any business!",
              rating: 4
            },
            {
              name: "Vikram Patel",
              content: "Great platform for connecting with talented editors. Our reels have never looked better!",
              rating: 5
            },
            {
              name: "Sneha Kapoor",
              content: "The support team is very responsive and helpful. The whole process was smooth and easy.",
              rating: 5
            }
          ]);
        }
        setErrorTestimonials(null);
      })
      .catch(() => {
        setTestimonials([
          {
            name: "Priya Sharma",
            content: "ReelLocal made our video marketing effortless. The editors are top-notch and delivery is always on time!",
            rating: 5
          },
          {
            name: "Rahul Verma",
            content: "Superb experience! The quality of work and professionalism exceeded our expectations.",
            rating: 5
          },
          {
            name: "Ananya Singh",
            content: "I loved the quick turnaround and the creative edits. Highly recommended for any business!",
            rating: 4
          },
          {
            name: "Vikram Patel",
            content: "Great platform for connecting with talented editors. Our reels have never looked better!",
            rating: 5
          },
          {
            name: "Sneha Kapoor",
            content: "The support team is very responsive and helpful. The whole process was smooth and easy.",
            rating: 5
          }
        ]);
        setErrorTestimonials(null);
      })
      .finally(() => setLoadingTestimonials(false));
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Upload Content',
      description: 'Easily upload your video content for editing.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our support team is available 24/7 to assist you with any questions or concerns.'
    },
    {
      icon: Star,
      title: 'Verified Editors',
      description: 'Only the best editors are handpicked to ensure high-quality work.'
    },
    {
      icon: CheckCircle,
      title: '100% Satisfaction',
      description: 'We guarantee 100% satisfaction or your money back.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer">
                <span className="rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
                  <Camera className="w-8 h-8 text-white transition-all duration-300" />
                </span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">
                  ReelLocal
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <LanguageSelector /> */}
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-all"
              >
                Login
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-teal-100 to-orange-100 text-teal-800 border-teal-200">
            ReelLocal
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Engaging Video Content
          </h1>
          <span className="block bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent mb-6 text-5xl md:text-6xl font-bold">
            Effortlessly
          </span>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ReelLocal is your one-stop platform for creating, editing, and distributing high-quality video content. Whether you're a business owner or an editor, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 px-8 py-3 text-lg"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* User Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={activeUserType === 'business' ? 'default' : 'ghost'}
                onClick={() => setActiveUserType('business')}
                className={activeUserType === 'business' ? 'bg-teal-600 text-white' : ''}
              >
                For Businesses
              </Button>
              <Button
                variant={activeUserType === 'editor' ? 'default' : 'ghost'}
                onClick={() => setActiveUserType('editor')}
                className={activeUserType === 'editor' ? 'bg-orange-500 text-white' : ''}
              >
                For Editors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeUserType === 'business' 
                ? 'How It Works for Businesses'
                : 'How It Works for Editors'
              }
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {activeUserType === 'business'
                ? 'Discover how ReelLocal can help your business create compelling video content.'
                : 'Learn how you can join our platform and start earning by editing videos.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            {loadingStats ? (
              <div className="col-span-3">Loading Stats...</div>
            ) : errorStats ? (
              <div className="col-span-3 text-red-200">Error loading stats</div>
            ) : stats ? (
              <>
                <div>
                  <div className="text-4xl font-bold mb-2">{stats.totalProjects}+</div>
                  <div className="text-teal-100">Videos Created</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">{stats.satisfactionRate}%</div>
                  <div className="text-teal-100">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">{stats.averageDelivery}</div>
                  <div className="text-teal-100">Average Delivery</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Clients Say
            </h2>
          </div>

            {loadingTestimonials ? (
            <div className="text-center">Loading Testimonials...</div>
            ) : errorTestimonials ? (
            <div className="text-red-500 text-center">Error loading testimonials</div>
            ) : testimonials.length === 0 ? (
            <div className="text-center text-gray-500">No testimonials available</div>
            ) : (
            <Carousel opts={{ loop: true, align: 'center', dragFree: true }} className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="px-2">
                    <Card className="h-full flex flex-col justify-center items-center shadow-lg bg-white rounded-2xl p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                      <p className="text-gray-600 mb-4 text-lg text-center">"{testimonial.content}"</p>
                      <p className="font-semibold text-gray-900 text-center">{testimonial.name}</p>
                </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Create?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join businesses and start creating your first project.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-teal-600 to-orange-500 hover:from-teal-700 hover:to-orange-600 px-8 py-3 text-lg"
            onClick={() => navigate('/signup')}
          >
            Start Your First Project
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                <span className="rounded-full p-1 bg-gradient-to-tr from-teal-400 to-orange-400 shadow-md transition-all duration-300 group-hover:scale-125">
                  <Camera className="w-8 h-8 text-white transition-all duration-300" />
                </span>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">
                  ReelLocal
              </h3>
              </div>
              <p className="text-gray-400">
                ReelLocal is your one-stop platform for creating, editing, and distributing high-quality video content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-teal-400" />For Businesses</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/upload" className="flex items-center gap-2 hover:text-white transition-colors"><Upload className="w-4 h-4" />Upload Content</Link></li>
                <li><Link to="/templates" className="flex items-center gap-2 hover:text-white transition-colors"><Video className="w-4 h-4" />Browse Templates</Link></li>
                <li><Link to="/projects" className="flex items-center gap-2 hover:text-white transition-colors"><FileText className="w-4 h-4" />Track Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-orange-400" />For Editors</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="flex items-center gap-2 hover:text-white transition-colors"><Briefcase className="w-4 h-4" />Join Platform</Link></li>
                <li><Link to="/jobs" className="flex items-center gap-2 hover:text-white transition-colors"><Video className="w-4 h-4" />Browse Jobs</Link></li>
                <li><Link to="/earnings" className="flex items-center gap-2 hover:text-white transition-colors"><FileText className="w-4 h-4" />Earn Money</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-red-400" />Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/support" className="flex items-center gap-2 hover:text-white transition-colors"><HelpCircle className="w-4 h-4" />Help Center</Link></li>
                <li><a href="mailto:support@reellocal.com" className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4" />Contact Us</a></li>
                <li><Link to="/terms" className="flex items-center gap-2 hover:text-white transition-colors"><FileText className="w-4 h-4" />Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 ReelLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
