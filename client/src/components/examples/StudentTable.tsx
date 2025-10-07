import StudentTable from '../StudentTable';

export default function StudentTableExample() {
  const mockStudents = [
    { id: '1', name: 'Alice Johnson', studentId: 'S001', points: 850 },
    { id: '2', name: 'Bob Smith', studentId: 'S002', points: 720 },
    { id: '3', name: 'Carol Davis', studentId: 'S003', points: 950 },
  ];

  return (
    <div className="p-4">
      <StudentTable 
        students={mockStudents}
        onUpdatePoints={(id, points) => {
          console.log(`Update student ${id} to ${points} points`);
        }}
      />
    </div>
  );
}