import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeedbackFormProps {
  onSubmit: (category: string, message: string) => void;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && message.trim()) {
      console.log('Feedback submitted:', { category, message });
      onSubmit(category, message);
      setCategory("");
      setMessage("");
      setCharCount(0);
    }
  };

  const isValid = category && message.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Submit Feedback
        </CardTitle>
        <CardDescription>
          Share your thoughts, questions, or concerns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="concern">Concern</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              data-testid="textarea-feedback"
              placeholder="Type your feedback here..."
              value={message}
              onChange={handleMessageChange}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Be specific and constructive</span>
              <span data-testid="text-charcount">
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!isValid}
            data-testid="button-submit-feedback"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}