/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useForgotPasswordRequest,
  useForgotPasswordVerify,
  useForgotPasswordReset,
} from '@/hooks/react-query/use-auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const requestMutation = useForgotPasswordRequest();
  const verifyMutation = useForgotPasswordVerify();
  const resetMutation = useForgotPasswordReset();

  const onRequest = async (e) => {
    e.preventDefault();
    await requestMutation.mutateAsync({ email });
    setStep(2);
  };

  // Prefill email from query param and auto-send OTP
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qpEmail = params.get('email');
    if (qpEmail) {
      setEmail(qpEmail);
      // Auto send OTP if not already sent
      if (!requestMutation.isSuccess && !requestMutation.isPending) {
        requestMutation.mutate(
          { email: qpEmail },
          {
            onSuccess: () => setStep(2),
          },
        );
      }
    }
  }, [location.search]);

  const onVerify = async (e) => {
    e.preventDefault();
    const res = await verifyMutation.mutateAsync({ email, otp });
    if (res?.resetToken) {
      setResetToken(res.resetToken);
      setStep(3);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    await resetMutation.mutateAsync({ resetToken, newPassword });
    navigate('/login');
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={onRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
              <p className="text-sm text-muted-foreground">
                An OTP was sent to {email}
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <Link className="underline" to="/login">
              Back to Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
