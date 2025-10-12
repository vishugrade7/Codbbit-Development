'use client';
import { AuthForm } from '@/components/AuthForm';
import { Header } from '@/components/Header';

export default function SignupPage() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pt-20">
        <AuthForm type="signup" />
      </div>
    </>
  );
}
