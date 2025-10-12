import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Always show login screen fresh: clear any prior session
  useEffect(() => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  }, []);

  const handleLogin = async (username: string, password: string, role: 'admin' | 'student' | 'master') => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const normalizedRole = (role === 'master') ? 'master' : role;
      const normalizedUsername = normalizedRole === 'student' ? String(username).toUpperCase() : String(username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: normalizedUsername, password, role: normalizedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        localStorage.setItem('userRole', normalizedRole);
        localStorage.setItem('username', normalizedUsername);
        localStorage.setItem('userId', data.user.id);
        
        if (normalizedRole === 'admin') setLocation('/admin');
        else if (normalizedRole === 'master') setLocation('/master-dashboard');
        else setLocation('/student');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      
      <LoginForm onLogin={handleLogin} error={error} />
      {authLoading && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}