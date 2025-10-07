import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, ShieldCheck, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import adminBg from "@/images/admin.png";
import studentBg from "@/images/student.png";

interface LoginFormProps {
  onLogin: (username: string, password: string, role: 'admin' | 'student') => void;
  error?: string | null;
}

export default function LoginForm({ onLogin, error }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentUsername, setStudentUsername] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(adminUsername, adminPassword, 'admin');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(studentUsername, studentPassword, 'student');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Backgrounds */}
      <div
        className={`pointer-events-none absolute inset-0 bg-center bg-cover transition-opacity duration-700 brightness-110 ${activeTab === 'student' ? 'opacity-100' : 'opacity-0'} transform transition-transform duration-700 ${activeTab === 'student' ? 'scale-100' : 'scale-110'}`}
        style={{ backgroundImage: `url(${studentBg})` }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-center bg-cover transition-opacity duration-700 brightness-110 ${activeTab === 'admin' ? 'opacity-100' : 'opacity-0'} transform transition-transform duration-700 ${activeTab === 'admin' ? 'scale-110' : 'scale-100'}`}
        style={{ backgroundImage: `url(${adminBg})` }}
        aria-hidden
      />
      {/* Reduce overlay to make background image more visible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 to-background/20" aria-hidden />
      {/* Master Admin quick access button (visible on hover) */}
      <div className="fixed bottom-3 left-3 group">
        <button
          onClick={() => { window.location.href = '/master'; }}
          className="transition-all duration-200 p-2 rounded-full border shadow-sm bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-md"
          aria-label="Master Admin"
          title="Master Admin"
        >
          <Crown className="w-4 h-4" />
        </button>
      </div>
      <Card className="relative z-10 w-full max-w-md bg-background/40 backdrop-blur-sm border-none shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'admin')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" data-testid="tab-student">
                <UserCircle className="w-4 h-4 mr-2" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" data-testid="tab-admin">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="space-y-4 mt-4">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-username">Student ID</Label>
                  <Input
                    id="student-username"
                    data-testid="input-student-username"
                    placeholder="Enter your student ID"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <PasswordInput id="student-password" data-testid="input-student-password" placeholder="Enter your password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" data-testid="button-student-login">
                  Sign In as Student
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4 mt-4">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    data-testid="input-admin-username"
                    placeholder="Enter admin username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <PasswordInput id="admin-password" data-testid="input-admin-password" placeholder="Enter admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" data-testid="button-admin-login">
                    Sign In as Admin
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setRegisterOpen(true); setRegError(null); setRegUsername(""); setRegPassword(""); setRegConfirm(""); }}>Register</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register as Admin</DialogTitle>
            <DialogDescription>Submit a request to master for approval.</DialogDescription>
          </DialogHeader>
          {regError && (<div className="text-sm text-destructive" role="alert">{regError}</div>)}
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="reg-username">Admin Username</Label>
              <Input id="reg-username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="Enter a username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <PasswordInput id="reg-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimum 6 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <PasswordInput id="reg-confirm" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="Re-enter password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Close</Button>
            <Button
              disabled={regSubmitting || regUsername.trim().length < 3 || regPassword.trim().length < 6 || regPassword.trim() !== regConfirm.trim()}
              onClick={async () => {
                setRegSubmitting(true);
                setRegError(null);
                try {
                  const res = await fetch('/api/admins/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: regUsername.trim(), password: regPassword.trim() })
                  });
                  const txt = await res.text();
                  if (!res.ok) {
                    let msg = 'Registration failed';
                    try { const j = JSON.parse(txt); msg = j?.message || msg; } catch {}
                    throw new Error(msg);
                  }
                  setRegisterOpen(false);
                } catch (e) {
                  setRegError(e instanceof Error ? e.message : 'Registration failed');
                } finally {
                  setRegSubmitting(false);
                }
              }}
            >
              {regSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}