import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ projectId, open, onClose }: Props) {
  const { refreshProjects } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      toast.error('Please enter a valid email address');  
      return;
    }

    setLoading(true);
    try {
      const response = await projectsAPI.addMember(projectId, email.trim(), 'member');
      if (response.success) {
        toast.success(`Member ${email} added successfully!`);
        setEmail('');
        onClose();
        await refreshProjects();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add member';
      if (message.includes('User not found')) {
        toast.error('User with this email is not registered. They need to create an account first.');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Project Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Member Email</Label>
            <p className="text-xs text-muted-foreground">
              User must already have an account to be added
            </p>
            <Input 
              placeholder="member@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMember()}
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel  
            </Button>
            <Button onClick={handleAddMember} disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}