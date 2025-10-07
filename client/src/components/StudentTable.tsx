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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Edit2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  studentId: string;
  points: number;
}

interface StudentTableProps {
  students: Student[];
  onUpdatePoints: (studentId: string, newPoints: number) => void;
}

export default function StudentTable({ students, onUpdatePoints }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditPoints(student.points);
    console.log('Edit triggered for:', student.name);
  };

  const handleSave = (studentId: string) => {
    console.log('Save triggered:', editPoints);
    onUpdatePoints(studentId, editPoints);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    console.log('Edit cancelled');
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
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                    <TableCell>
                      {editingId === student.id ? (
                        <Input
                          type="number"
                          value={editPoints}
                          onChange={(e) => setEditPoints(Number(e.target.value))}
                          className="w-24"
                          data-testid={`input-points-${student.id}`}
                        />
                      ) : (
                        <Badge variant="secondary" className="font-mono" data-testid={`text-points-${student.id}`}>
                          {student.points}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === student.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleSave(student.id)}
                            data-testid={`button-save-${student.id}`}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            data-testid={`button-cancel-${student.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(student)}
                          data-testid={`button-edit-${student.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}