import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { useLogin } from '@/hooks/react-query/use-auth';
import { setAuthStateAtom } from '@/lib/auth.atoms';
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
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuthState = useSetAtom(setAuthStateAtom);
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useLogin();

  const onSubmit = async (e) => {
    e.preventDefault();
    const { accessToken, user } = await mutateAsync({ email, password });
    setAuthState({ token: accessToken, user });
    navigate('/');
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-right">
              <Link
                to={`/forgot-password?email=${encodeURIComponent(email || '')}`}
                className="text-sm underline text-muted-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link className="underline" to="/signup">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
