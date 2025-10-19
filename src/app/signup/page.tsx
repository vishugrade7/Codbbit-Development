'use client';
import { AuthForm } from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start md:justify-center bg-background p-4 pt-8 md:pt-4">
      <AuthForm type="signup" />
    </div>
  );
}
