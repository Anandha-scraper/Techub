import AdminStats from '../AdminStats';

export default function AdminStatsExample() {
  return (
    <div className="p-4">
      <AdminStats
        totalStudents={150}
        averagePoints={785}
        pendingFeedback={12}
        topPerformer="Alice Johnson"
      />
    </div>
  );
}