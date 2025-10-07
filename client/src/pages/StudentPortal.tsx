import { useState } from "react";
import StudentDashboard from "@/components/StudentDashboard";
import FeedbackForm from "@/components/FeedbackForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function StudentPortal() {
  const [, setLocation] = useLocation();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // todo: remove mock functionality - replace with real data from backend
  const studentData = {
    name: 'Alice Johnson',
    studentId: 'S001',
    points: 850,
    maxPoints: 1000,
    history: [
      { date: '2025-10-05', points: 50, reason: 'Excellent project presentation' },
      { date: '2025-10-03', points: 30, reason: 'Active class participation' },
      { date: '2025-10-01', points: 20, reason: 'Homework completed on time' },
      { date: '2025-09-28', points: 40, reason: 'Outstanding quiz performance' },
    ]
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setLocation('/');
  };

  const handleFeedbackSubmit = (category: string, message: string) => {
    // todo: remove mock functionality - replace with API call
    console.log('Feedback submitted:', { category, message });
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Student Portal</h1>
              <p className="text-sm text-muted-foreground">View your performance and submit feedback</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <StudentDashboard
            studentName={studentData.name}
            studentId={studentData.studentId}
            points={studentData.points}
            maxPoints={studentData.maxPoints}
            history={studentData.history}
          />

          <FeedbackForm onSubmit={handleFeedbackSubmit} />

          {feedbackSubmitted && (
            <div className="fixed bottom-4 right-4 bg-chart-2 text-white px-4 py-2 rounded-md shadow-lg" data-testid="toast-success">
              Feedback submitted successfully!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}