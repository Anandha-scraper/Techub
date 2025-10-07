import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, password: string, role: 'admin' | 'student') => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentUsername, setStudentUsername] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Admin login triggered');
    onLogin(adminUsername, adminPassword, 'admin');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Student login triggered');
    onLogin(studentUsername, studentPassword, 'student');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
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
                  <Input
                    id="student-password"
                    data-testid="input-student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
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
                  <Input
                    id="admin-password"
                    data-testid="input-admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-admin-login">
                  Sign In as Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}