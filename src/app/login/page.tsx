'use client';
import { AuthForm } from '@/components/AuthForm';
import { Header } from '@/components/Header';

export default function LoginPage() {
  return (
    <>
    <Header />
    <div className="flex min-h-screen flex-col items-center justify-center bg-background pt-16">
      <AuthForm type="login" />
    </div>
    </>
  );
}
