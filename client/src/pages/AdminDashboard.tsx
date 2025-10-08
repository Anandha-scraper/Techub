import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/AdminStats";
import StudentTable from "@/components/StudentTable";
import ExcelUpload from "@/components/ExcelUpload";
import FeedbackList from "@/components/FeedbackList";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Upload, MessageSquare, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  type Student = { id: string; name: string; studentId: string; points: number; section?: string; batch?: string };
  type Feedback = {
    id: string;
    studentName: string;
    studentId: string;
    category: string;
    message: string;
    date: string;
    status: 'new' | 'reviewed';
    read: boolean;
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addStudentId, setAddStudentId] = useState("");
  const [addSection, setAddSection] = useState("");
  const [addBatch, setAddBatch] = useState("");
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState<string | null>(null);
  const [createdOpen, setCreatedOpen] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchStudents = fetch('/api/students', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
      })
      .then((data: Student[]) => {
        if (isMounted) setStudents(data);
      });

    const fetchFeedbacks = fetch('/api/feedback', {
      headers: { 'x-admin-id': localStorage.getItem('userId') || '' }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch feedback');
        return res.json();
      })
      .then((data: Feedback[]) => {
        if (isMounted) setFeedbacks(data);
      });

    Promise.all([fetchStudents, fetchFeedbacks])
      .catch((e: any) => {
        if (isMounted) setError(e?.message || 'Failed to load data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setLocation('/');
  };

  const handleUpdatePoints = async (studentId: string, newPoints: number, reason?: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify({ points: newPoints, reason: reason || 'Adjusted by admin' })
      });
      if (!res.ok) throw new Error('Failed to update points');
      const updated: Student = await res.json();
      setStudents(prev => prev.map(s => s.studentId === updated.studentId ? { ...s, points: updated.points } : s));
    } catch (e) {
      console.error(e);
      setError('Failed to update points');
    }
  };

  const handleAddPoints = async (studentId: string, amount: number, reason?: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/points/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify({ amount, reason: reason || 'Added by admin' })
      });
      if (!res.ok) throw new Error('Failed to add points');
      const updated: Student = await res.json();
      setStudents(prev => prev.map(s => s.studentId === updated.studentId ? { ...s, points: updated.points } : s));
    } catch (e) {
      console.error(e);
      setError('Failed to add points');
    }
  };

  const handleMinusPoints = async (studentId: string, amount: number, reason?: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/points/minus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify({ amount, reason: reason || 'Deducted by admin' })
      });
      if (!res.ok) throw new Error('Failed to deduct points');
      const updated: Student = await res.json();
      setStudents(prev => prev.map(s => s.studentId === updated.studentId ? { ...s, points: updated.points } : s));
    } catch (e) {
      console.error(e);
      setError('Failed to deduct points');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      console.log('DELETE /api/students/', studentId);
      const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`, { method: 'DELETE', headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
      const text = await res.text();
      if (!res.ok) {
        let msg = 'Failed to delete student';
        try {
          const j = JSON.parse(text);
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      try { console.log('Delete response:', JSON.parse(text)); } catch { console.log('Delete response:', text); }
      // Refresh list from server to ensure DB state reflected
      const studentsRes = await fetch('/api/students', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
      if (studentsRes.ok) {
        const data: Student[] = await studentsRes.json();
        setStudents(data);
      } else {
        setStudents(prev => prev.filter(s => s.studentId !== studentId));
      }
    } catch (e) {
      console.error(e);
      setError('Failed to delete student');
    }
  };

  const handleUploaded = async () => {
    try {
      const studentsRes = await fetch('/api/students');
      if (studentsRes.ok) {
        const data: Student[] = await studentsRes.json();
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to mark feedback as read');
      
      // Update the feedback in the local state
      setFeedbacks(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, read: true, status: 'reviewed' } : f
      ));
    } catch (e) {
      console.error(e);
      setError('Failed to mark feedback as read');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': localStorage.getItem('userId') || ''
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete feedback');
      }
      
      // Remove the feedback from the local state
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    } catch (e) {
      console.error(e);
      setError('Failed to delete feedback');
    }
  };

  const totalStudents = students.length;
  const averagePoints = students.length > 0 ? (students.reduce((sum, s) => sum + s.points, 0) / students.length) : 0;
  const pendingFeedback = feedbacks.filter(f => f.status === 'new').length;
  const topPerformer = students.length > 0 ? students.reduce((top, s) => s.points > top.points ? s : top).name : undefined;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage student points and feedback</p>
              <p className="text-xs text-muted-foreground">Logged in as <span className="font-mono">{localStorage.getItem('username') || '-'}</span></p>
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

      <main className="container mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="text-sm text-red-600" role="alert">{error}</div>
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}
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
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Manage your students</div>
              <Button onClick={() => { setAddOpen(true); setAddErr(null); setAddName(""); setAddStudentId(""); setAddSection(""); setAddBatch(""); }}>Add Student</Button>
            </div>
            <StudentTable
              students={students}
              onUpdatePoints={handleUpdatePoints}
              onDeleteStudent={handleDeleteStudent}
              onAddPoints={handleAddPoints}
              onMinusPoints={handleMinusPoints}
            />
          </TabsContent>

          <TabsContent value="upload">
            <ExcelUpload onUploaded={handleUploaded} />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackList 
              feedbacks={feedbacks} 
              onMarkAsRead={handleMarkAsRead} 
              onDelete={handleDeleteFeedback}
              showDeleteButton={true}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>Update your admin password for the current account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Username</div>
              <div className="text-sm font-mono">{localStorage.getItem('username') || '-'}</div>
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
                const username = String(localStorage.getItem('username') || '').trim();
                const res = await fetch('/api/auth/change-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, oldPassword: oldPassword.trim(), newPassword: newPassword.trim(), role: 'admin' })
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Create a new student and login credentials.</DialogDescription>
          </DialogHeader>
          {addErr && <div className="text-sm text-destructive" role="alert">{addErr}</div>}
          <div className="grid gap-3">
            <div className="space-y-1">
              <label className="text-sm" htmlFor="add-name">Name</label>
              <Input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Student name" />
            </div>
            <div className="space-y-1">
              <label className="text-sm" htmlFor="add-id">Register Number</label>
              <Input id="add-id" value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)} placeholder="Student ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm" htmlFor="add-section">Section</label>
                <Input id="add-section" value={addSection} onChange={(e) => setAddSection(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <label className="text-sm" htmlFor="add-batch">Batch</label>
                <Input id="add-batch" value={addBatch} onChange={(e) => setAddBatch(e.target.value)} placeholder="Eg: 2023-2027" />
              </div>
            </div>
            {/* Password is auto-generated server-side and shown after create */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={adding || addName.trim().length === 0 || addStudentId.trim().length === 0} onClick={async () => {
              setAdding(true);
              setAddErr(null);
              try {
                const res = await fetch('/api/students', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
                  body: JSON.stringify({ name: addName.trim(), studentId: addStudentId.trim(), section: addSection.trim() || undefined, batch: addBatch.trim() || undefined })
                });
                const txt = await res.text();
                if (!res.ok) {
                  let msg = 'Failed to create student';
                  try { const j = JSON.parse(txt); msg = j?.message || msg; } catch {}
                  throw new Error(msg);
                }
                // notify success with generated credentials if any (in-app dialog)
                try {
                  const created = JSON.parse(txt);
                  const pwd = created?.initialPassword || null;
                  const sid = created?.studentId || addStudentId.trim().toUpperCase();
                  setCreatedStudentId(sid);
                  setCreatedPassword(pwd);
                  setCreatedOpen(true);
                } catch {}
                // refresh
                const studentsRes = await fetch('/api/students', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
                if (studentsRes.ok) {
                  const data: Student[] = await studentsRes.json();
                  setStudents(data);
                }
                setAddOpen(false);
              } catch (e) {
                setAddErr(e instanceof Error ? e.message : 'Failed to create student');
              } finally {
                setAdding(false);
              }
            }}>{adding ? 'Adding…' : 'Add Student'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={createdOpen} onOpenChange={setCreatedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student created</DialogTitle>
            <DialogDescription>Login credentials generated successfully.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">ID</div>
            <div className="text-sm font-mono">{createdStudentId || '-'}</div>
            <div className="text-xs text-muted-foreground mt-3">Password</div>
            <div className="text-sm font-mono">{createdPassword || '(no password generated)'}</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}