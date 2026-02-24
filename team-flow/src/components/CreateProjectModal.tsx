import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus, Mail } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const { createProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' });
      return;
    }
    
    if (memberEmails.includes(email)) {
      setErrors({ ...errors, email: 'This email is already added' });
      return;
    }
    
    setMemberEmails([...memberEmails, email]);
    setEmailInput('');
    setErrors({ ...errors, email: '' });
  };

  const removeEmail = (email: string) => {
    setMemberEmails(memberEmails.filter(e => e !== email));
  };

  const handleCreate = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Project name is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await createProject(name.trim(), description.trim(), memberEmails);
    setLoading(false);
    setName('');
    setDescription('');
    setMemberEmails([]);
    setEmailInput('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="What is this project about?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>Invite Members by Email</Label>
            <p className="text-xs text-muted-foreground">They will receive an invitation email to join this project</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="member@example.com" 
                  value={emailInput} 
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={addEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            {memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {memberEmails.map(email => (
                  <Badge key={email} variant="secondary" className="pl-2 pr-1 py-1">
                    {email}
                    <button 
                      onClick={() => removeEmail(email)}
                      className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
