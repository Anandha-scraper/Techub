import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, MessageSquare, Award } from "lucide-react";

interface AdminStatsProps {
  totalStudents: number;
  averagePoints: number;
  pendingFeedback: number;
  topPerformer?: string;
}

export default function AdminStats({ 
  totalStudents, 
  averagePoints, 
  pendingFeedback,
  topPerformer 
}: AdminStatsProps) {
  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: Users,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      testId: "stat-total-students"
    },
    {
      title: "Average Points",
      value: averagePoints.toFixed(0),
      icon: Award,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      testId: "stat-average-points"
    },
    {
      title: "Pending Feedback",
      value: pendingFeedback.toString(),
      icon: MessageSquare,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "stat-pending-feedback"
    },
    {
      title: "Top Performer",
      value: topPerformer || "N/A",
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      testId: "stat-top-performer"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid={stat.testId}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}