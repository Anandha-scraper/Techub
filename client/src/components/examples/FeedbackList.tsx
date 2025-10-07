import FeedbackList from '../FeedbackList';

export default function FeedbackListExample() {
  const mockFeedbacks = [
    {
      id: '1',
      studentName: 'Alice Johnson',
      studentId: 'S001',
      category: 'question',
      message: 'Could you please explain how the bonus points system works?',
      date: '2025-10-05 14:30',
      status: 'new' as const,
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      studentId: 'S002',
      category: 'suggestion',
      message: 'It would be great to have a mobile app for checking points on the go.',
      date: '2025-10-04 10:15',
      status: 'reviewed' as const,
    },
  ];

  return (
    <div className="p-4">
      <FeedbackList feedbacks={mockFeedbacks} />
    </div>
  );
}