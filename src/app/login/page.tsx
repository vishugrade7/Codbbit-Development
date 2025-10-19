'use client';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start md:justify-center bg-background pt-16">
      <AuthForm type="login" />
    </div>
  );
}
