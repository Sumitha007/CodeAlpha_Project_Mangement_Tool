import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Comment } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, getAvatarColor, formatTimestamp } from '@/lib/utils';
import { Send } from 'lucide-react';

interface Props {
  comments: Comment[];
  projectId: string;
  boardId: string;
  taskId: string;
}

export default function CommentSection({ comments, projectId, boardId, taskId }: Props) {
  const { addComment } = useApp();
  const [text, setText] = useState('');

  const handlePost = () => {
    if (!text.trim()) return;
    addComment(projectId, boardId, taskId, text.trim());
    setText('');
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Comments ({comments.length})</h4>
      <ScrollArea className="max-h-60">
        <div className="space-y-3 pr-2">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No comments yet. Start the conversation!</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 animate-fade-in">
              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                <AvatarFallback style={{ backgroundColor: getAvatarColor(c.user.name) }} className="text-[9px] font-medium text-primary-foreground">
                  {getInitials(c.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.user.name}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(c.timestamp)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 break-words">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
        />
        <Button size="icon" className="shrink-0 self-end" onClick={handlePost} disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
