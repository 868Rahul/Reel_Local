
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  delay?: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
}

const StatsCard = ({ title, value, icon: Icon, delay = "0s", gradientFrom, gradientTo, iconColor }: StatsCardProps) => {
  return (
    <Card 
      className={`hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-white ${gradientFrom} ${gradientTo} animate-scale-in`}
      style={{animationDelay: delay}}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${iconColor} bg-clip-text text-transparent`}>{value}</p>
          </div>
          <div className={`h-12 w-12 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className={`h-6 w-6 ${iconColor.replace('bg-gradient-to-r', '').replace('bg-clip-text text-transparent', '').trim()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
