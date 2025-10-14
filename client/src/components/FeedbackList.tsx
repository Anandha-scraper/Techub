import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Clock, User, Check, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Feedback {
  id: string;
  studentName: string;
  studentId: string;
  category: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed';
  read: boolean;
}

interface FeedbackListProps {
  feedbacks: Feedback[];
  onMarkAsRead?: (feedbackId: string) => void;
  onDelete?: (feedbackId: string) => void;
  onBulkDelete?: (feedbackIds: string[]) => void;
  showDeleteButton?: boolean;
}

const categoryColors: Record<string, string> = {
  general: 'bg-chart-1/10 text-chart-1',
  question: 'bg-chart-5/10 text-chart-5',
  concern: 'bg-chart-3/10 text-chart-3',
  suggestion: 'bg-chart-2/10 text-chart-2',
};

export default function FeedbackList({ feedbacks, onMarkAsRead, onDelete, onBulkDelete, showDeleteButton = false }: FeedbackListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === feedbacks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(feedbacks.map(f => f.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} feedback(s)? This action cannot be undone.`)) {
      return;
    }
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const allSelected = feedbacks.length > 0 && selectedIds.size === feedbacks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Student Feedback
            </CardTitle>
            <CardDescription>
              {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received
              {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
            </CardDescription>
          </div>
          {showDeleteButton && feedbacks.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all feedbacks"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="h-8"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
            </div>
          )}
        </div>
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
                <Card key={feedback.id} data-testid={`feedback-${feedback.id}`} className={selectedIds.has(feedback.id) ? "border-primary" : ""}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        {showDeleteButton && (
                          <Checkbox
                            checked={selectedIds.has(feedback.id)}
                            onCheckedChange={() => toggleSelect(feedback.id)}
                            aria-label={`Select feedback from ${feedback.studentName}`}
                            className="mt-1"
                          />
                        )}
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
                          {feedback.read && (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm" data-testid={`message-${feedback.id}`}>
                        {feedback.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span data-testid={`date-${feedback.id}`}>{feedback.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!feedback.read && onMarkAsRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMarkAsRead(feedback.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                          {showDeleteButton && onDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDelete(feedback.id)}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
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