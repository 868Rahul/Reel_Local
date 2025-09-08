import { Upload, CheckCircle, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "./StatsCard";
// import { useLanguage } from '@/contexts/LanguageContext'; // Removed

const StatsSection = () => {
  const { userStats } = useAuth();
  // const { t } = useLanguage(); // Removed

  // Default values if stats are not loaded yet
  const stats = userStats || {
    totalProjects: 0,
    completed: 0,
    inProgress: 0,
    avgRating: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Projects"
        value={stats.totalProjects.toString()}
        icon={Upload}
        gradientFrom="to-teal-50/50"
        gradientTo="border-teal-100"
        iconColor="from-teal-600 to-emerald-600 text-teal-600"
      />
      
      <StatsCard
        title="Completed"
        value={stats.completed.toString()}
        icon={CheckCircle}
        delay="0.1s"
        gradientFrom="to-emerald-50/50"
        gradientTo="border-emerald-100"
        iconColor="from-emerald-600 to-green-600 text-emerald-600"
      />
      
      <StatsCard
        title="In Progress"
        value={stats.inProgress.toString()}
        icon={Clock}
        delay="0.2s"
        gradientFrom="to-blue-50/50"
        gradientTo="border-blue-100"
        iconColor="from-blue-600 to-indigo-600 text-blue-600"
      />
      
      <StatsCard
        title="Average Rating"
        value={stats.avgRating.toString()}
        icon={Star}
        delay="0.3s"
        gradientFrom="to-amber-50/50"
        gradientTo="border-amber-100"
        iconColor="from-amber-500 to-orange-500 text-amber-500"
      />
    </div>
  );
};

export default StatsSection;
