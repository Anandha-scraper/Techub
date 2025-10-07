import FeedbackForm from '../FeedbackForm';

export default function FeedbackFormExample() {
  return (
    <div className="p-4">
      <FeedbackForm
        onSubmit={(category, message) => {
          console.log('Feedback:', category, message);
        }}
      />
    </div>
  );
}