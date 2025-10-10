import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings } from "lucide-react";

interface AdminItem {
  id: string;
  username: string;
  role: 'admin';
  approved: boolean;
  lastLogin?: string | null;
}

export default function MasterDashboard() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const currentUsername = (typeof window !== 'undefined' ? localStorage.getItem('username') : '') || '';
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdTargetAdmin, setPwdTargetAdmin] = useState<AdminItem | null>(null);
  const [pwdNew, setPwdNew] = useState("");
  const [pwdChanging, setPwdChanging] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdShow, setPwdShow] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delTargetAdmin, setDelTargetAdmin] = useState<AdminItem | null>(null);
  const [delPreview, setDelPreview] = useState<{ admin: { id: string; username: string }; students: Array<{ name: string; studentId: string }> } | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [delConfirming, setDelConfirming] = useState(false);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);

  const fetchAdmins = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/master/admins', { headers: { 'x-master-key': 'master' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load admins');
      setAdmins(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/master/admins/${id}/approve`, { method: 'POST', headers: { 'x-master-key': 'master' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approve failed');
      await fetchAdmins();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/master/stats', { headers: { 'x-master-key': 'master', 'Accept': 'application/json' } });
        const txt = await res.text();
        if (!res.ok) return;
        try { const j = JSON.parse(txt); setTotalStudents(typeof j?.totalStudents === 'number' ? j.totalStudents : null); } catch {}
      } catch {}
    };
    loadStats();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Master Admin Panel</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { setSettingsOpen(true); setError(null); setSaveMsg(null); }}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="hover:bg-red-600 hover:text-white hover:border-red-600"
                onClick={() => {
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('username');
                  localStorage.removeItem('userId');
                  window.location.href = '/';
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && admins.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          )}
          {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={fetchAdmins} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
            {typeof totalStudents === 'number' && (
              <div className="ml-auto text-sm text-muted-foreground">Total students: <span className="font-medium text-foreground">{totalStudents}</span></div>
            )}
          </div>
          <div className="space-y-2">
            {admins.map(a => (
              <div key={a.id} className="flex items-center justify-between border rounded p-2">
                <div className="text-sm">
                  <div className="font-medium">{a.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.role} • {a.approved ? 'approved' : 'pending'}
                    {a.lastLogin && (
                      <span> • last login {new Date(a.lastLogin).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!a.approved && (
                    <Button size="sm" onClick={() => approve(a.id)}>Approve</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setPwdTargetAdmin(a); setPwdNew(""); setPwdError(null); setPwdShow(false); setPwdDialogOpen(true); }}>Change Password</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    setDelTargetAdmin(a);
                    setDelError(null);
                    setDelPreview(null);
                    setDelOpen(true);
                    setDelLoading(true);
                    try {
                      const res = await fetch(`/api/master/admins/${encodeURIComponent(a.id)}/preview-delete`, { headers: { 'x-master-key': 'master', 'Accept': 'application/json' } });
                      const contentType = res.headers.get('content-type') || '';
                      const raw = await res.text();
                      if (!res.ok) {
                        // try parse message
                        if (contentType.includes('application/json')) {
                          try { const j = JSON.parse(raw); throw new Error(j?.message || 'Failed to load preview'); } catch { throw new Error('Failed to load preview'); }
                        }
                        throw new Error(raw || 'Failed to load preview');
                      }
                      if (!contentType.includes('application/json')) {
                        const snippet = (raw || '').slice(0, 120);
                        throw new Error(snippet || 'Unexpected response from server');
                      }
                      const data = JSON.parse(raw);
                      setDelPreview(data);
                    } catch (e) {
                      setDelError(e instanceof Error ? e.message : 'Failed to load preview');
                    } finally {
                      setDelLoading(false);
                    }
                  }}>Delete</Button>
                </div>
              </div>
            ))}
            {admins.length === 0 && <div className="text-sm text-muted-foreground">No admins found.</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>Update your master account details. Leave a field blank to keep it unchanged.</DialogDescription>
          </DialogHeader>
          {saveMsg && (
            <div className="mb-3 text-sm text-chart-2">{saveMsg}</div>
          )}
          {error && (
            <div className="mb-3 text-sm text-destructive">{error}</div>
          )}
          <div className="grid gap-4">
            <div className="grid gap-1">
              <span className="text-xs text-muted-foreground">Current Username</span>
              <div className="inline-flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded border bg-muted/30 font-mono">{currentUsername || '-'}</span>
              </div>
            </div>
            <div className="grid gap-1 md:grid-cols-2 md:gap-4">
              <div className="space-y-2">
                <label className="text-sm" htmlFor="master-new-username">New Username</label>
                <Input id="master-new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Leave blank to keep current" autoFocus />
                <p className="text-xs text-muted-foreground">3–50 chars. Must be unique.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm" htmlFor="master-new-password">New Password</label>
                <PasswordInput id="master-new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
                <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSettingsOpen(false); setSaveMsg(null); setError(null); }}>Close</Button>
            <Button
              disabled={(!newUsername.trim() && !newPassword.trim()) || (newPassword.trim() !== '' && newPassword.trim().length < 6) || saving}
              onClick={async () => {
                setError(null);
                setSaveMsg(null);
                setSaving(true);
                try {
                  const id = localStorage.getItem('userId');
                  if (!id) throw new Error('Missing user id');
                  const body: { username?: string; password?: string } = {};
                  if (newUsername.trim()) body.username = newUsername.trim();
                  if (newPassword.trim()) body.password = newPassword.trim();
                  if (!body.username && !body.password) throw new Error('Nothing to update');
                  const res = await fetch(`/api/master/users/admin/${encodeURIComponent(id)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'x-master-key': 'master' },
                    body: JSON.stringify(body)
                  });
                  const txt = await res.text();
                  if (!res.ok) {
                    let msg = 'Failed to update account';
                    try { const j = JSON.parse(txt); msg = j?.message || msg; } catch {}
                    throw new Error(msg);
                  }
                  let updatedUsername = newUsername.trim() || localStorage.getItem('username') || '';
                  if (updatedUsername) localStorage.setItem('username', updatedUsername);
                  setNewUsername("");
                  setNewPassword("");
                  setSaveMsg('Account updated successfully');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to update');
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwdDialogOpen} onOpenChange={setPwdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>Set a new password for the selected admin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Admin Username</div>
              <div className="text-sm font-mono">{pwdTargetAdmin?.username || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">New Password</div>
              <PasswordInput value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} placeholder="New password (min 6 chars)" />
            </div>
            {pwdError && (<div className="text-sm text-destructive" role="alert">{pwdError}</div>)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPwdDialogOpen(false); setPwdError(null); setPwdNew(""); }}>Cancel</Button>
            <Button disabled={pwdChanging || !pwdTargetAdmin || pwdNew.trim().length < 6} onClick={async () => {
              if (!pwdTargetAdmin) return;
              setPwdChanging(true);
              try {
                const res = await fetch(`/api/master/users/admin/${encodeURIComponent(pwdTargetAdmin.id)}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'x-master-key': 'master' },
                  body: JSON.stringify({ password: pwdNew.trim() })
                });
                const txt = await res.text();
                if (!res.ok) {
                  let msg = 'Failed to change password';
                  try { const j = JSON.parse(txt); msg = j?.message || msg; } catch {}
                  throw new Error(msg);
                }
                setPwdDialogOpen(false);
              } catch (e) {
                setPwdError(e instanceof Error ? e.message : 'Failed to change password');
              } finally {
                setPwdChanging(false);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              This will permanently delete the admin and all of their students and related records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-auto">
            {delError && <div className="text-sm text-destructive" role="alert">{delError}</div>}
            <div className="text-sm">
              <div><span className="text-muted-foreground">Admin:</span> <span className="font-medium">{delTargetAdmin?.username || '-'}</span></div>
            </div>
            {delLoading && <div className="text-sm text-muted-foreground">Loading preview…</div>}
            {delPreview && (
              <div className="text-sm">
                <div className="mb-1 text-muted-foreground">Students to be deleted ({delPreview.students.length}):</div>
                <ul className="list-disc pl-5 space-y-1">
                  {delPreview.students.map(s => (
                    <li key={s.studentId}><span className="font-medium">{s.name}</span> <span className="text-muted-foreground">({s.studentId})</span></li>
                  ))}
                  {delPreview.students.length === 0 && <li className="text-muted-foreground">No students under this admin.</li>}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDelOpen(false); }}>Cancel</Button>
            <Button variant="destructive" disabled={!delTargetAdmin || delConfirming} onClick={async () => {
              if (!delTargetAdmin) return;
              setDelConfirming(true);
              setDelError(null);
              try {
                const res = await fetch(`/api/master/admins/${encodeURIComponent(delTargetAdmin.id)}`, { method: 'DELETE', headers: { 'x-master-key': 'master', 'Accept': 'application/json' } });
                const ct = res.headers.get('content-type') || '';
                const txt = await res.text();
                if (!res.ok) {
                  if (ct.includes('application/json')) {
                    try { const j = JSON.parse(txt); throw new Error(j?.message || 'Failed to delete admin'); } catch { throw new Error('Failed to delete admin'); }
                  }
                  throw new Error(txt || 'Failed to delete admin');
                }
                if (!ct.includes('application/json')) {
                  const snippet = (txt || '').slice(0, 120);
                  throw new Error(snippet || 'Unexpected response from server');
                }
                setDelOpen(false);
                await fetchAdmins();
              } catch (e) {
                setDelError(e instanceof Error ? e.message : 'Failed to delete admin');
              } finally {
                setDelConfirming(false);
              }
            }}>{delConfirming ? 'Deleting…' : 'Delete Admin & Students'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


