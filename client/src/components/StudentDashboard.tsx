import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Calendar } from "lucide-react";

interface StudentDashboardProps {
  studentName: string;
  studentId: string;
  points: number;
  maxPoints?: number;
  history?: Array<{ date: string; points: number; reason: string }>;
}

export default function StudentDashboard({ 
  studentName, 
  studentId, 
  points,
  maxPoints = 1000,
  history = []
}: StudentDashboardProps) {
  const percentage = (points / maxPoints) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-welcome">
          Welcome, {studentName}
        </h1>
        <p className="text-muted-foreground" data-testid="text-studentid">
          Student ID: <span className="font-mono">{studentId}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-chart-1" />
            Your Points
          </CardTitle>
          <CardDescription>Current performance score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-5xl font-mono font-bold text-primary" data-testid="text-total-points">
              {points}
            </div>
            <p className="text-sm text-muted-foreground">out of {maxPoints} points</p>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span>{maxPoints}</span>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-2" />
              Points History
            </CardTitle>
            <CardDescription>Recent point changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0" data-testid={`history-${index}`}>
                  <div className="mt-1">
                    <TrendingUp className="w-4 h-4 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-sm font-mono font-semibold" data-testid={`points-${index}`}>
                    +{entry.points}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}