import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Always show login screen fresh: clear any prior session
  useEffect(() => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  }, []);

  const handleLogin = async (username: string, password: string, role: 'admin' | 'student' | 'master') => {
    try {
      setError(null);
      
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
    }
  };

  return (
    <div className="min-h-screen">
      
      <LoginForm onLogin={handleLogin} error={error} />
    </div>
  );
}