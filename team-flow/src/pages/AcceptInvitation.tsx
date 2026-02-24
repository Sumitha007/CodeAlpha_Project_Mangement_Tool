import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Mail, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationsAPI.getByToken(token!);
      if (response.success) {
        setInvitation(response.data);
      } else {
        setError(response.message || 'Invalid invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      const response = await invitationsAPI.accept(token!);
      if (response.success) {
        toast({ title: 'Success!', description: 'You have joined the project' });
        setTimeout(() => {
          navigate(`/projects/${response.data.projectId}`);
        }, 1500);
      }
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to accept invitation' 
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await invitationsAPI.decline(token!);
      toast({ title: 'Invitation declined' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to decline invitation' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Project Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-semibold text-lg">{invitation?.project?.name}</p>
              </div>
              {invitation?.project?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{invitation.project.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Invited by</p>
                <p className="text-sm font-medium">{invitation?.invitedBy?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your role</p>
                <p className="text-sm font-medium capitalize">{invitation?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-200">
                You'll be able to collaborate with the team once you accept
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleDecline}
              disabled={accepting}
            >
              Decline
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
