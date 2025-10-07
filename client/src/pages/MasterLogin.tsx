import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import masterBg from "@/images/master.png";

export default function MasterLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const transformStyle = useMemo(() => {
    const dx = (mouse.x - 0.5) * 10;
    const dy = (mouse.y - 0.5) * 10;
    return { transform: `translate3d(${dx}px, ${dy}px, 0) scale(1.06)` } as React.CSSProperties;
  }, [mouse]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'master' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      if (data.success) {
        localStorage.setItem('userRole', 'master');
        localStorage.setItem('username', username);
        localStorage.setItem('userId', data.user.id);
        setLocation('/master-dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMouse({ x, y });
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover transition-transform duration-150 ease-out brightness-110"
        style={{ backgroundImage: `url(${masterBg})`, ...transformStyle }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 to-background/20" aria-hidden />
      <div className="fixed top-3 left-3 z-50">
        <Button variant="outline" className="hover:bg-gray-200 hover:text-foreground" onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/')}>Back</Button>
      </div>
      
      <Card className="relative z-10 w-full max-w-md bg-background/40 backdrop-blur-sm border-none shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Master Login</CardTitle>
          <CardDescription className="text-center">Sign in as Master Admin</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="master-username">Username</Label>
              <Input id="master-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="master-password">Password</Label>
              <PasswordInput id="master-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Sign In as Master</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


