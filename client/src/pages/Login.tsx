import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string, role: 'admin' | 'student') => {
    // todo: remove mock functionality - replace with real authentication
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    
    if (role === 'admin') {
      setLocation('/admin');
    } else {
      setLocation('/student');
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}