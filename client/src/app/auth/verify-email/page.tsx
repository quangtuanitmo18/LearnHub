'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVerifyEmail } from '@/hooks/use-auth';
import { ROUTE_CONFIG } from '@/configs/routes';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailMatch = searchParams.get('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (emailMatch) {
      setEmail(emailMatch);
    }
  }, [emailMatch]);

  const verifyEmailMutation = useVerifyEmail();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || otp.length !== 6) return;

    verifyEmailMutation.mutate(
      { email, otp },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            router.push(ROUTE_CONFIG.AUTH.SIGN_IN);
          }, 3000);
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <Card className="py-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
          <CardDescription className="text-base">
            Your email has been verified successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground text-sm">
            Redirecting you to sign in page in a few seconds...
          </p>
          <Button
            onClick={() => router.push(ROUTE_CONFIG.AUTH.SIGN_IN)}
            size="lg"
            className="w-full"
          >
            Continue to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-6">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription className="text-base">
          Please enter the 6-digit verification code sent to your email.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              readOnly={!!emailMatch}
              className={emailMatch ? 'bg-muted' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="text-center font-mono text-lg tracking-widest"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={verifyEmailMutation.isPending || otp.length !== 6 || !email}
          >
            {verifyEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function VerifyEmailPage() {
  return (
    <div className="bg-primary-foreground container grid h-svh max-w-none items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 py-8 sm:w-[480px] sm:p-8">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
