import StudentDashboard from '../StudentDashboard';

export default function StudentDashboardExample() {
  const mockHistory = [
    { date: '2025-10-05', points: 50, reason: 'Excellent project presentation' },
    { date: '2025-10-03', points: 30, reason: 'Active class participation' },
    { date: '2025-10-01', points: 20, reason: 'Homework completed on time' },
  ];

  return (
    <div className="p-4">
      <StudentDashboard
        studentName="Alice Johnson"
        studentId="S001"
        points={850}
        maxPoints={1000}
        history={mockHistory}
      />
    </div>
  );
}