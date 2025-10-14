import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as TextInput } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Edit2, Save, X, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  studentId: string;
  points: number;
  section?: string;
  batch?: string;
  gitLink?: string;
}

interface StudentTableProps {
  students: Student[];
  onUpdatePoints: (studentId: string, newPoints: number, reason?: string) => void;
  onDeleteStudent?: (studentId: string) => void;
  onAddPoints?: (studentId: string, amount: number, reason?: string) => void;
  onMinusPoints?: (studentId: string, amount: number, reason?: string) => void;
}

export default function StudentTable({ students, onUpdatePoints, onDeleteStudent, onAddPoints, onMinusPoints }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | { type: 'add' | 'minus' | 'update'; studentId: string; amount: number }>(null);
  const [reasonText, setReasonText] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<null | Student>(null);
  const [newPassword, setNewPassword] = useState("");
  const [gitLink, setGitLink] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    // Repurpose edit pencil to change password and git link
    setSelectedStudentForPassword(student);
    setNewPassword("");
    setGitLink(student.gitLink || "");
    setPasswordDialogOpen(true);
  };

  const handleSave = (studentId: string) => {
    if (editingId?.startsWith('add-') && onAddPoints) {
      setPendingAction({ type: 'add', studentId, amount: editPoints });
      setReasonText("");
      setReasonDialogOpen(true);
    } else if (editingId?.startsWith('minus-') && onMinusPoints) {
      setPendingAction({ type: 'minus', studentId, amount: editPoints });
      setReasonText("");
      setReasonDialogOpen(true);
    } else {
      onUpdatePoints(studentId, editPoints);
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string) => {
    if (e.key === 'Enter') {
      handleSave(studentId);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Points Management</CardTitle>
        <CardDescription>View and update student performance points</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-students"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Git Link</TableHead>
                <TableHead>Current Points</TableHead>
                <TableHead>Add Points</TableHead>
                <TableHead>Minus Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                    <TableCell className="font-mono text-sm" data-testid={`text-studentid-${student.id}`}>
                      {student.studentId}
                    </TableCell>
                    <TableCell data-testid={`text-name-${student.id}`}>{student.name}</TableCell>
                    <TableCell data-testid={`text-section-${student.id}`}>{student.section || '-'}</TableCell>
                    <TableCell data-testid={`text-batch-${student.id}`}>{student.batch || '-'}</TableCell>
                    <TableCell>
                      {student.gitLink ? (
                        <a 
                          href={student.gitLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title={student.gitLink}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono" data-testid={`text-points-${student.id}`}>
                        {student.points}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === `add-${student.id}` ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={String(editPoints)}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, '');
                              setEditPoints(v === '' ? 0 : Number(v));
                            }}
                            onKeyDown={(e) => handleKeyDown(e, student.studentId)}
                            className="w-24"
                            data-testid={`input-add-${student.id}`}
                          />
                          <Button size="sm" onClick={() => handleSave(student.studentId)} data-testid={`button-addsave-${student.id}`}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} data-testid={`button-addcancel-${student.id}`}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingId(`add-${student.id}`); 
                              setEditPoints(5);
                            }} 
                            data-testid={`button-add5-${student.id}`}
                            className="w-10"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingId(`add-${student.id}`); 
                              setEditPoints(10);
                            }} 
                            data-testid={`button-add10-${student.id}`}
                            className="w-10"
                          >
                            +10
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(`add-${student.id}`); setEditPoints(0); }} data-testid={`button-add-${student.id}`}>
                            Custom
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === `minus-${student.id}` ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={String(editPoints)}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, '');
                              setEditPoints(v === '' ? 0 : Number(v));
                            }}
                            onKeyDown={(e) => handleKeyDown(e, student.studentId)}
                            className="w-24"
                            data-testid={`input-minus-${student.id}`}
                          />
                          <Button size="sm" onClick={() => handleSave(student.studentId)} data-testid={`button-minussave-${student.id}`}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} data-testid={`button-minuscancel-${student.id}`}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingId(`minus-${student.id}`); 
                              setEditPoints(5);
                            }} 
                            data-testid={`button-minus5-${student.id}`}
                            className="w-10"
                          >
                            -5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingId(`minus-${student.id}`); 
                              setEditPoints(10);
                            }} 
                            data-testid={`button-minus10-${student.id}`}
                            className="w-10"
                          >
                            -10
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(`minus-${student.id}`); setEditPoints(0); }} data-testid={`button-minus-${student.id}`}>
                            Custom
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(student)}
                          data-testid={`button-edit-${student.id}`}
                          aria-label="Change password"
                          title="Change password"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {onDeleteStudent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteStudent(student.studentId)}
                            data-testid={`button-delete-${student.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason (optional)</DialogTitle>
            <DialogDescription>Enter a reason for this point change. You can skip.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <TextInput
              placeholder="Reason (optional)"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              data-testid="input-reason"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                if (!pendingAction) { setReasonDialogOpen(false); return; }
                const { type, studentId, amount } = pendingAction;
                if (type === 'add' && onAddPoints) onAddPoints(studentId, amount);
                if (type === 'minus' && onMinusPoints) onMinusPoints(studentId, amount);
                setReasonDialogOpen(false);
                setPendingAction(null);
                setEditingId(null);
              }}
              data-testid="button-reason-skip"
            >
              Skip
            </Button>
            <Button
              onClick={() => {
                if (!pendingAction) { setReasonDialogOpen(false); return; }
                const { type, studentId, amount } = pendingAction;
                if (type === 'add' && onAddPoints) onAddPoints(studentId, amount, reasonText || undefined);
                if (type === 'minus' && onMinusPoints) onMinusPoints(studentId, amount, reasonText || undefined);
                setReasonDialogOpen(false);
                setPendingAction(null);
                setEditingId(null);
              }}
              data-testid="button-reason-submit"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>Update the login password and Git link for this student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1">
              <span className="text-xs text-muted-foreground">Student Name</span>
              <div className="text-sm font-medium">{selectedStudentForPassword?.name || '-'}</div>
            </div>
            <div className="grid gap-1">
              <span className="text-xs text-muted-foreground">Register Number</span>
              <div className="text-sm font-mono">{selectedStudentForPassword?.studentId || '-'}</div>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">New Password (optional)</span>
              <div className="relative">
                <TextInput
                  type={showNewPwd ? 'text' : 'password'}
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 border rounded" onClick={() => setShowNewPwd(v => !v)}>
                  {showNewPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Git Link (GitHub/GitLab profile or repository)</span>
              <TextInput
                type="text"
                placeholder="https://github.com/username"
                value={gitLink}
                onChange={(e) => setGitLink(e.target.value)}
                data-testid="input-git-link"
              />
            </div>
            {passwordError && (
              <div className="text-sm text-red-600" role="alert">{passwordError}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { 
                setPasswordDialogOpen(false); 
                setSelectedStudentForPassword(null); 
                setNewPassword(""); 
                setGitLink("");
                setPasswordError(null); 
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={passwordSubmitting || !selectedStudentForPassword}
              onClick={async () => {
                if (!selectedStudentForPassword) return;
                setPasswordSubmitting(true);
                setPasswordError(null);
                
                try {
                  // Update password if provided
                  if (newPassword.trim().length >= 6) {
                    const pwdRes = await fetch(`/api/students/${encodeURIComponent(selectedStudentForPassword.studentId)}/password`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ password: newPassword.trim() })
                    });
                    if (!pwdRes.ok) {
                      const text = await pwdRes.text();
                      try { 
                        const j = JSON.parse(text); 
                        setPasswordError(j?.message || 'Failed to update password'); 
                      } catch { 
                        setPasswordError(text || 'Failed to update password'); 
                      }
                      setPasswordSubmitting(false);
                      return;
                    }
                  }
                  
                  // Update git link
                  const gitRes = await fetch(`/api/students/${encodeURIComponent(selectedStudentForPassword.studentId)}/gitlink`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gitLink: gitLink.trim() })
                  });
                  if (!gitRes.ok) {
                    const text = await gitRes.text();
                    try { 
                      const j = JSON.parse(text); 
                      setPasswordError(j?.message || 'Failed to update git link'); 
                    } catch { 
                      setPasswordError(text || 'Failed to update git link'); 
                    }
                    setPasswordSubmitting(false);
                    return;
                  }
                  
                  setPasswordDialogOpen(false);
                  setSelectedStudentForPassword(null);
                  setNewPassword("");
                  setGitLink("");
                  setPasswordError(null);
                  
                  // Optionally refresh the student list to show updated git link
                  window.location.reload();
                } catch (e) {
                  console.error(e);
                  setPasswordError('Failed to update student details');
                } finally {
                  setPasswordSubmitting(false);
                }
              }}
              data-testid="button-password-submit"
            >
              {passwordSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}