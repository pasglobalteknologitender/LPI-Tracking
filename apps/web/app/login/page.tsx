'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Ship, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const demoCredentials = [
  {
    label: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
  },
  {
    label: 'Operator',
    email: 'operator@example.com',
    password: 'operator123',
  },
  {
    label: 'Viewer',
    email: 'viewer@example.com',
    password: 'viewer123',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
        toast.error('Invalid credentials', {
          description: 'Please check your email and password',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-start overflow-y-auto bg-background px-4 py-6 sm:justify-center sm:py-8">
      <Card className="w-full max-w-md gap-0 rounded-3xl border-border/70 shadow-2xl shadow-slate-950/[0.06]">
        <CardHeader className="space-y-3 py-5 text-center sm:space-y-4 sm:py-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-700/20 sm:h-14 sm:w-14">
            <Ship className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Link Pasific Logistics
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5 sm:gap-7">
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="lpi-input h-11"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FieldLabel>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="lpi-input h-11 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-xl bg-primary font-medium shadow-lg shadow-blue-700/20 transition-all hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 space-y-2 rounded-2xl border border-border/70 bg-muted/45 p-3 text-sm sm:p-4">
            {demoCredentials.map((credential) => (
              <button
                key={credential.email}
                type="button"
                onClick={() => {
                  setEmail(credential.email);
                  setPassword(credential.password);
                }}
                className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-left text-xs transition hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="font-medium text-foreground">
                  {credential.label}
                </span>
                <span className="text-muted-foreground">
                  {credential.email} / {credential.password}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
