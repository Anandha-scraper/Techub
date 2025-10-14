import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/AdminStats";
import StudentTable from "@/components/StudentTable";
import ExcelUpload from "@/components/ExcelUpload";
import FeedbackList from "@/components/FeedbackList";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { LogOut, Users, Upload, MessageSquare, Settings, CalendarDays, Check, X, Briefcase } from "lucide-react";
import { Loader2, RotateCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SpinWheel from "@/components/SpinWheel";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  type Student = { id: string; name: string; studentId: string; points: number; section?: string; batch?: string; gitLink?: string };
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
  // Attendance state
  const toIso = (d: Date) => d.toISOString().slice(0,10);
  const toDisplay = (iso: string) => { const [y,m,dd] = iso.split('-'); return `${dd}/${m}/${y}`; };
  const [attDate, setAttDate] = useState<string>(() => toIso(new Date()));
  const [attStatuses, setAttStatuses] = useState<Record<string, 'present' | 'absent' | 'on-duty'>>({});
  const [attExistingCount, setAttExistingCount] = useState<number>(0);
  const [attLocked, setAttLocked] = useState<boolean>(false);
  const [attSummary, setAttSummary] = useState<Array<{ date: string; present: number; absent: number; onDuty: number; total: number }>>([]);
  const [attSaving, setAttSaving] = useState(false);

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

  // Load attendance for selected date
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance?date=${encodeURIComponent(attDate)}`, { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
        if (!res.ok) return;
        const rows: Array<{ studentId: string; status: 'present' | 'absent' }> = await res.json();
        const map: Record<string, 'present' | 'absent'> = {};
        for (const r of rows) { map[r.studentId] = r.status; }
        setAttStatuses(map);
        setAttExistingCount(rows.length);
      } catch {}
    };
    loadAttendance();
  }, [attDate]);

  // Load summary list
  const loadSummary = async () => {
    try {
      const res = await fetch('/api/attendance/summary', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
      if (!res.ok) return;
      const rows: Array<{ date: string; present: number; absent: number; total: number }> = await res.json();
      setAttSummary(rows);
    } catch {}
  };
  useEffect(() => { loadSummary(); }, [attLocked, attDate]);

  // Lock attendance once all students have entries for the selected date
  useEffect(() => {
    if (students.length > 0) {
      setAttLocked(attExistingCount >= students.length);
    } else {
      setAttLocked(false);
    }
  }, [attExistingCount, students.length]);

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

  const handleBulkDeleteFeedback = async (feedbackIds: string[]) => {
    try {
      const res = await fetch('/api/feedback/bulk-delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': localStorage.getItem('userId') || ''
        },
        body: JSON.stringify({ feedbackIds })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete feedbacks');
      }
      
      // Remove the feedbacks from the local state
      setFeedbacks(prev => prev.filter(f => !feedbackIds.includes(f.id)));
      toast({ title: 'Success', description: `Deleted ${feedbackIds.length} feedback(s)` });
    } catch (e) {
      console.error(e);
      setError('Failed to delete feedbacks');
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
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
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
            <TabsTrigger value="attendance" data-testid="tab-attendance">
              <CalendarDays className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="spin" data-testid="tab-spin">
              <RotateCw className="w-4 h-4 mr-2" />
              Spin Wheel
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
              onBulkDelete={handleBulkDeleteFeedback}
              showDeleteButton={true}
            />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm">Date</label>
              <input className="border rounded px-2 py-1 bg-background" type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} />
              <div className="text-xs text-muted-foreground">Mark each student as present, on duty, or absent, then Save.</div>
              <div className="ml-auto text-xs text-muted-foreground">
                {attLocked ? 'Already marked for this date' : `${Object.keys(attStatuses).length}/${students.length} marked`}
              </div>
            </div>
            <div className="border rounded">
              <div className="grid grid-cols-6 gap-2 p-2 text-xs text-muted-foreground border-b">
                <div className="col-span-2">Name</div>
                <div>Register No.</div>
                <div className="text-center">Present</div>
                <div className="text-center">On Duty</div>
                <div className="text-center">Absent</div>
              </div>
              <div className="divide-y">
                {students.map(s => {
                  const status = attStatuses[s.studentId];
                  return (
                    <div key={s.studentId} className="grid grid-cols-6 gap-2 p-2 items-center">
                      <div className="col-span-2 truncate" title={s.name}>{s.name}</div>
                      <div className="font-mono text-sm">{s.studentId}</div>
                      <div className="flex items-center justify-center">
                        <Button size="sm" disabled={attLocked} variant={status === 'present' ? 'default' : 'outline'} onClick={() => setAttStatuses(prev => ({ ...prev, [s.studentId]: 'present' }))}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-center">
                        <Button size="sm" disabled={attLocked} variant={status === 'on-duty' ? 'secondary' : 'outline'} onClick={() => setAttStatuses(prev => ({ ...prev, [s.studentId]: 'on-duty' }))}>
                          <Briefcase className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-center">
                        <Button size="sm" disabled={attLocked} variant={status === 'absent' ? 'destructive' : 'outline'} onClick={() => setAttStatuses(prev => ({ ...prev, [s.studentId]: 'absent' }))}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">No students to display.</div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              {/** Require every student to be marked before enabling save */}
              <Button disabled={attLocked || attSaving || students.length === 0 || !students.every(s => attStatuses[s.studentId])} onClick={async () => {
                setAttSaving(true);
                try {
                  // One entry per student for this date
                  const items = students.map(s => ({ studentId: s.studentId, status: attStatuses[s.studentId] as 'present' | 'absent' | 'on-duty' }));
                  if (!items.every(it => it.status === 'present' || it.status === 'absent' || it.status === 'on-duty')) {
                    setError('Please mark all students before saving');
                    return;
                  }
                  const res = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
                    body: JSON.stringify({ date: attDate, items })
                  });
                  if (!res.ok) {
                    const t = await res.text();
                    try { const j = JSON.parse(t); throw new Error(j?.message || 'Failed to save attendance'); } catch { throw new Error(t || 'Failed to save attendance'); }
                  }
                  // Reload saved statuses from server to reflect persisted state
                  try {
                    const r2 = await fetch(`/api/attendance?date=${encodeURIComponent(attDate)}`, { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
                    if (r2.ok) {
                      const rows: Array<{ studentId: string; status: 'present' | 'absent' }> = await r2.json();
                      const map: Record<string, 'present' | 'absent'> = {};
                      for (const r of rows) { map[r.studentId] = r.status; }
                      // Keep saved selections and lock to show read-only recorded state
                      setAttStatuses(map);
                      setAttExistingCount(rows.length);
                      setAttLocked(true);
                      loadSummary();
                      toast({ title: 'Attendance marked', description: `Saved ${rows.length} records for ${attDate}` });
                    }
                  } catch {}
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to save attendance');
                } finally {
                  setAttSaving(false);
                }
              }}>{attSaving ? 'Saving…' : 'Save Attendance'}</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Attendance Records</CardTitle>
                    <Button size="sm" variant="outline" onClick={async () => {
                      // Prompt dates selection via simple prompt: "all" or CSV of YYYY-MM-DD
                      const suggestion = attSummary.slice(0,10).map(r => r.date).join(',');
                      const input = prompt('Enter dates as YYYY-MM-DD comma-separated, or type ALL', suggestion || 'ALL');
                      if (input === null) return;
                      const dates = (input || '').trim().toLowerCase() === 'all' ? 'all' : (input || '').split(',').map(s => s.trim()).filter(Boolean).join(',');
                      try {
                        const res = await fetch(`/api/attendance/export?dates=${encodeURIComponent(dates)}`, { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
                        if (!res.ok) throw new Error('Failed to fetch export data');
                        const j = await res.json();
                        const rows: Array<{ studentId: string; name: string; date: string; status: 'present' | 'absent' | 'on-duty' }> = j?.rows || [];
                        // Generate PDF using static imports
                        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
                        doc.setFontSize(14);
                        doc.text('Attendance Report', 40, 40);
                        const tableBody = rows.map(r => [r.studentId, r.name, toDisplay(r.date), r.status.toUpperCase()]);
                        autoTable(doc, { startY: 60, head: [["Register No.", "Name", "Date", "Status"]], body: tableBody, styles: { fontSize: 10 }, headStyles: { fillColor: [33, 33, 33] } });
                        doc.save('attendance.pdf');
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Failed to generate PDF');
                      }
                    }}>Download PDF</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">Recent dates with attendance counts</div>
                  <div className="border rounded">
                    <div className="grid grid-cols-5 gap-2 p-2 text-xs text-muted-foreground border-b">
                      <div>Date</div>
                      <div className="text-center">Present</div>
                      <div className="text-center">On Duty</div>
                      <div className="text-center">Absent</div>
                      <div className="text-center">Actions</div>
                    </div>
                    <div className="divide-y">
                      {attSummary.map((r) => (
                        <div key={r.date} className="grid grid-cols-5 gap-2 p-2 text-sm items-center">
                          <div>{toDisplay(r.date)}</div>
                          <div className="text-center text-green-600">{r.present}</div>
                          <div className="text-center text-blue-600">{r.onDuty || 0}</div>
                          <div className="text-center text-red-600">{r.absent}</div>
                          <div className="text-center">
                            <Button size="sm" variant="outline" className="hover:bg-red-600 hover:text-white hover:border-red-600" onClick={async () => {
                              if (!confirm(`Delete attendance for ${toDisplay(r.date)}?`)) return;
                              try {
                                const del = await fetch(`/api/attendance/by-date/${encodeURIComponent(r.date)}`, { method: 'DELETE', headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
                                if (!del.ok) throw new Error('Failed to delete');
                                await loadSummary();
                                // Refresh current date attendance from server to reflect true DB state
                                if (attDate === r.date) {
                                  try {
                                    const res = await fetch(`/api/attendance?date=${encodeURIComponent(attDate)}`, { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
                                    const rows: Array<{ studentId: string; status: 'present' | 'absent' }> = res.ok ? await res.json() : [];
                                    const map: Record<string, 'present' | 'absent'> = {};
                                    for (const rr of rows) { map[rr.studentId] = rr.status; }
                                    setAttStatuses(map);
                                    setAttExistingCount(rows.length);
                                    setAttLocked(rows.length >= students.length);
                                  } catch {
                                    setAttStatuses({});
                                    setAttExistingCount(0);
                                    setAttLocked(false);
                                  }
                                }
                                toast({ title: 'Attendance deleted', description: `Removed records for ${toDisplay(r.date)}` });
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Failed to delete attendance');
                              }
                            }}>Delete</Button>
                          </div>
                        </div>
                      ))}
                      {attSummary.length === 0 && (
                        <div className="p-3 text-sm text-muted-foreground">No attendance records yet.</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spin">
            <SpinWheel />
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