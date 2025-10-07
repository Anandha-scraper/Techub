import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Feedback {
  id: string;
  studentName: string;
  studentId: string;
  category: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed';
}

interface FeedbackListProps {
  feedbacks: Feedback[];
}

const categoryColors: Record<string, string> = {
  general: 'bg-chart-1/10 text-chart-1',
  question: 'bg-chart-5/10 text-chart-5',
  concern: 'bg-chart-3/10 text-chart-3',
  suggestion: 'bg-chart-2/10 text-chart-2',
};

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Student Feedback
        </CardTitle>
        <CardDescription>
          {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No feedback yet</p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <Card key={feedback.id} data-testid={`feedback-${feedback.id}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium" data-testid={`student-name-${feedback.id}`}>
                              {feedback.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {feedback.studentId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={categoryColors[feedback.category] || 'bg-muted'}
                            data-testid={`category-${feedback.id}`}
                          >
                            {feedback.category}
                          </Badge>
                          {feedback.status === 'new' && (
                            <Badge variant="outline" className="border-chart-2 text-chart-2">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm" data-testid={`message-${feedback.id}`}>
                        {feedback.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span data-testid={`date-${feedback.id}`}>{feedback.date}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}