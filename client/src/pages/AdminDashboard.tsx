import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/AdminStats";
import StudentTable from "@/components/StudentTable";
import ExcelUpload from "@/components/ExcelUpload";
import FeedbackList from "@/components/FeedbackList";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Upload, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  // todo: remove mock functionality - replace with real data from backend
  const [students, setStudents] = useState([
    { id: '1', name: 'Alice Johnson', studentId: 'S001', points: 850 },
    { id: '2', name: 'Bob Smith', studentId: 'S002', points: 720 },
    { id: '3', name: 'Carol Davis', studentId: 'S003', points: 950 },
    { id: '4', name: 'David Wilson', studentId: 'S004', points: 680 },
    { id: '5', name: 'Emma Brown', studentId: 'S005', points: 890 },
  ]);

  const [feedbacks] = useState([
    {
      id: '1',
      studentName: 'Alice Johnson',
      studentId: 'S001',
      category: 'question',
      message: 'Could you please explain how the bonus points system works?',
      date: '2025-10-05 14:30',
      status: 'new' as const,
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      studentId: 'S002',
      category: 'suggestion',
      message: 'It would be great to have a mobile app for checking points on the go.',
      date: '2025-10-04 10:15',
      status: 'reviewed' as const,
    },
    {
      id: '3',
      studentName: 'Carol Davis',
      studentId: 'S003',
      category: 'concern',
      message: 'I noticed my points from last week haven\'t been updated yet.',
      date: '2025-10-03 09:45',
      status: 'new' as const,
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setLocation('/');
  };

  const handleUpdatePoints = (studentId: string, newPoints: number) => {
    // todo: remove mock functionality - replace with API call
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, points: newPoints } : s
    ));
  };

  const handleFileUpload = (file: File) => {
    // todo: remove mock functionality - replace with actual file processing
    console.log('Processing file:', file.name);
  };

  const totalStudents = students.length;
  const averagePoints = students.reduce((sum, s) => sum + s.points, 0) / students.length;
  const pendingFeedback = feedbacks.filter(f => f.status === 'new').length;
  const topPerformer = students.reduce((top, s) => s.points > top.points ? s : top).name;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage student points and feedback</p>
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

      <main className="container mx-auto px-4 py-8 space-y-6">
        <AdminStats
          totalStudents={totalStudents}
          averagePoints={averagePoints}
          pendingFeedback={pendingFeedback}
          topPerformer={topPerformer}
        />

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students" data-testid="tab-students">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentTable students={students} onUpdatePoints={handleUpdatePoints} />
          </TabsContent>

          <TabsContent value="upload">
            <ExcelUpload onFileUpload={handleFileUpload} />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackList feedbacks={feedbacks} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}