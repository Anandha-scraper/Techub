import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import StudentDashboard from "@/components/StudentDashboard";
import FeedbackForm from "@/components/FeedbackForm";
import StudentFeedbackList from "@/components/StudentFeedbackList";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3 } from "lucide-react";
import { CalendarDays } from "lucide-react";

export default function StudentPortal() {
  const [, setLocation] = useLocation();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [studentData, setStudentData] = useState<{ name: string; studentId: string; points: number; maxPoints?: number; history: Array<{ date: string; points: number; reason: string }> }>({ name: '', studentId: '', points: 0, maxPoints: 1000, history: [] });
  const [feedbacks, setFeedbacks] = useState<Array<{ id: string; studentName: string; studentId: string; category: string; message: string; date: string; status: 'new' | 'reviewed'; read: boolean }>>([]);
  const [attendance, setAttendance] = useState<Array<{ date: string; status: 'present' | 'absent' }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem('username') || '';
    if (!username) {
      setLocation('/');
      return;
    }
    setLoading(true);
    setError(null);
    const readJsonSafe = async (res: Response) => {
      const contentType = res.headers.get('content-type') || '';
      const bodyText = await res.text();
      if (!res.ok) {
        const maybe = contentType.includes('application/json');
        let msg = 'Request failed';
        if (maybe) {
          try { const j = JSON.parse(bodyText); msg = j?.message || msg; } catch {}
        } else {
          msg = bodyText || msg;
        }
        throw new Error(msg);
      }
      if (contentType.includes('application/json')) {
        try { return JSON.parse(bodyText); } catch { return null; }
      }
      // Unexpected HTML or other content
      throw new Error('Unexpected response from server');
    };

    const load = async () => {
      try {
        // Fetch student profile by studentId (username)
        const sRes = await fetch(`/api/students/by-id/${encodeURIComponent(username)}`, { headers: { 'Accept': 'application/json' } });
        const s = await readJsonSafe(sRes);
        // Fetch point transactions
        const tRes = await fetch(`/api/transactions?studentId=${encodeURIComponent(username)}`, { headers: { 'Accept': 'application/json' } });
        let tJson: any[] = [];
        try { tJson = await readJsonSafe(tRes); } catch { tJson = []; }
        const history = Array.isArray(tJson) ? tJson.map((t: any) => ({ date: t.date, points: t.points, reason: t.reason })) : [];
        setStudentData({ name: s.name, studentId: s.studentId, points: s.points, maxPoints: 1000, history });
        
        // Fetch student feedback
        const fRes = await fetch(`/api/feedback/student/${encodeURIComponent(username.toUpperCase())}`, { headers: { 'Accept': 'application/json' } });
        let fJson: any[] = [];
        try { fJson = await readJsonSafe(fRes); } catch { fJson = []; }
        setFeedbacks(Array.isArray(fJson) ? fJson : []);

        // Fetch attendance history
        try {
          const aRes = await fetch(`/api/attendance/student/${encodeURIComponent(username.toUpperCase())}`, { headers: { 'Accept': 'application/json' } });
          let aJson: any[] = [];
          try { aJson = await readJsonSafe(aRes); } catch { aJson = []; }
          const rows = Array.isArray(aJson) ? aJson.map(r => ({ date: r.date, status: r.status })) : [];
          setAttendance(rows);
        } catch {}
      } catch (e: any) {
        const msg: string = typeof e?.message === 'string' ? e.message : 'Failed to load data';
        setError(msg.includes('<!DOCTYPE') ? 'Failed to reach API. Is the server running?' : msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setLocation('/');
  };

  const handleFeedbackSubmit = async (category: string, message: string) => {
    try {
      const username = localStorage.getItem('username') || '';
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: username.toUpperCase(), studentName: studentData.name, category, message })
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 3000);
      
      // Refresh feedback list
      const fRes = await fetch(`/api/feedback/student/${encodeURIComponent(username.toUpperCase())}`, { headers: { 'Accept': 'application/json' } });
      if (fRes.ok) {
        const fJson = await fRes.json();
        setFeedbacks(Array.isArray(fJson) ? fJson : []);
      }
    } catch (e) {
      console.error(e);
      setFeedbackSubmitted(false);
      setError('Failed to submit feedback');
    }
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
              <Button variant="outline" onClick={() => { setSettingsOpen(true); setChangeError(null); setOldPassword(""); setNewPassword(""); }} aria-label="Settings" title="Change password">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="hover:bg-red-600 hover:text-white hover:border-red-600" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">{error}</div>
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <CalendarDays className="w-4 h-4 mr-2" />
                Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <StudentDashboard
                studentName={studentData.name}
                studentId={studentData.studentId}
                points={studentData.points}
                maxPoints={studentData.maxPoints}
                history={studentData.history}
              />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <FeedbackForm onSubmit={handleFeedbackSubmit} />
              <StudentFeedbackList feedbacks={feedbacks} />
            </TabsContent>

            <TabsContent value="attendance" className="space-y-3">
              <div className="text-sm text-muted-foreground">Your attendance by date</div>
              <div className="border rounded">
                <div className="grid grid-cols-2 gap-2 p-2 text-xs text-muted-foreground border-b">
                  <div>Date</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {attendance.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 p-2 text-sm">
                      <div>{r.date}</div>
                      <div className={r.status === 'present' ? 'text-green-600' : 'text-red-600'}>{r.status}</div>
                    </div>
                  ))}
                  {attendance.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">No attendance records yet.</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {feedbackSubmitted && (
            <div className="fixed bottom-4 right-4 bg-chart-2 text-white px-4 py-2 rounded-md shadow-lg" data-testid="toast-success">
              Feedback submitted successfully!
            </div>
          )}
        </div>
      </main>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your student password for the current account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Student ID</div>
              <div className="text-sm font-mono">{studentData.studentId || '-'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Current Password</div>
              <PasswordInput value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">New Password</div>
              <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
            </div>
            {changeError && (<div className="text-sm text-red-600" role="alert">{changeError}</div>)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSettingsOpen(false); setChangeError(null); setOldPassword(""); setNewPassword(""); }}>Cancel</Button>
            <Button disabled={changing || newPassword.trim().length < 6 || oldPassword.trim().length === 0} onClick={async () => {
              setChanging(true);
              try {
                const username = String(studentData.studentId || localStorage.getItem('username') || '').trim().toUpperCase();
                const res = await fetch('/api/auth/change-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, oldPassword: oldPassword.trim(), newPassword: newPassword.trim(), role: 'student' })
                });
                if (!res.ok) {
                  const text = await res.text();
                  try { const j = JSON.parse(text); setChangeError(j?.message || 'Failed to change password'); } catch { setChangeError(text || 'Failed to change password'); }
                  return;
                }
                setSettingsOpen(false);
              } catch (e) {
                setChangeError('Failed to change password');
              } finally {
                setChanging(false);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}