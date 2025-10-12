
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Trophy, Code, Bot, List, Shield, GitBranch, CheckSquare, BarChart, FileCode, Users, Search, Edit, Star, Send } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { Header } from "./Header";
import { motion } from "framer-motion";
import { Input } from "./ui/input";

export function LandingPage() {
  const features = [
      {
        icon: <Code className="h-8 w-8 text-primary" />,
        title: 'Real-time Code Execution',
        description:
          'Execute Apex code against a real Salesforce org and get immediate feedback, just like in a real-world scenario.',
      },
      {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: 'AI-Powered Assistant',
        description: 'Get unstuck with Codbee, our AI tutor that provides hints and explains concepts without giving away the solution.',
      },
      {
        icon: <List className="h-8 w-8 text-primary" />,
        title: 'Curated Problem Sheets',
        description: 'Practice with targeted problem lists for interview prep, specific topics like SOQL, or Triggers.',
      },
      {
        icon: <Trophy className="h-8 w-8 text-primary" />,
        title: 'Competitive Leaderboards',
        description: 'See how you stack up against other Salesforce developers and climb the ranks by solving problems.',
      },
      {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: 'Secure Salesforce Integration',
        description: 'Connect your Salesforce developer org securely using OAuth 2.0 to run code in a real environment.',
      },
      {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: 'Realistic Interview Prep',
        description:
          'Solve problems that mirror what you\'ll face in technical interviews for Salesforce developer roles.',
      },
    ];

  return (
    <div className="bg-background text-foreground antialiased">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 md:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_45rem_at_50%_100%,hsl(var(--primary)/0.1),transparent)]" aria-hidden="true"></div>
          <div className="container mx-auto px-4 z-10">
            <div className="mx-auto max-w-3xl text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
              >
                Master Salesforce Apex
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg leading-8 text-muted-foreground"
              >
                The ultimate platform for mastering Salesforce Apex. Sharpen your skills, compete on leaderboards, and prepare for certifications with real-world coding challenges.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <Button asChild className="group h-10 px-6 text-sm md:h-11 md:px-8 md:text-base bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/signup">
                    Start for Free
                    <ArrowRight className="-mr-1 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-10 px-6 text-sm md:h-11 md:px-8 md:text-base">
                  <Link href="/problems">Explore Problems</Link>
                </Button>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
              className="relative mt-16 flow-root sm:mt-24 max-w-4xl mx-auto"
            >
              <div className="relative -m-2 rounded-xl bg-muted/20 p-2 ring-1 ring-inset ring-muted/30 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/image 1.png"
                  alt="App screenshot"
                  width={2432}
                  height={1442}
                  className="rounded-md shadow-2xl ring-1 ring-muted/20"
                  priority
                />
                 <div className="absolute -left-12 -top-24 w-24 h-24 md:w-48 md:h-48">
                   <Image src="/image 2.GIF" alt="Codbbit Owl Mascot" width={200} height={200} className="[transform:rotate(300deg)]" />
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Features designed to make you a Salesforce pro
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              We've built a comprehensive platform to give you the tools and practice you need to excel.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-muted/20">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-4 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">What developers are saying</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Thousands of developers use Codbbit to sharpen their Apex skills.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="italic">
                    "Codbbit has been a game-changer for my interview prep. The problems are realistic and the real-time execution environment is invaluable."
                  </p>
                </CardContent>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">John Doe</p>
                    <p className="text-sm text-muted-foreground">Salesforce Developer</p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="italic">
                    "The AI assistant is amazing. It helps me understand concepts without just giving me the answer. My coding has improved so much."
                  </p>
                </CardContent>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704e" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Senior Apex Developer</p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="italic">
                    "I love the problem sheets. I can focus on specific areas where I need to improve, like asynchronous Apex or SOQL performance."
                  </p>
                </CardContent>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704f" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">Sam Adams</p>
                    <p className="text-sm text-muted-foreground">Salesforce Technical Architect</p>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col gap-4">
                 <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
                   <Image src="/logo.png" alt="Codbbit Logo" width={24} height={24} />
                   <h1 className="text-md font-bold font-headline text-foreground">
                      Codbbit
                  </h1>
                </Link>
                <p className="text-sm text-muted-foreground">The ultimate platform for mastering Salesforce Apex.</p>
              </div>
              <div className="md:col-span-3">
                  <h3 className="font-semibold text-lg mb-4">Subscribe to our newsletter</h3>
                  <p className="text-muted-foreground mb-4">Get the latest news, updates, and tips straight to your inbox.</p>
                  <form className="flex w-full max-w-md gap-2">
                      <Input type="email" placeholder="Enter your email" />
                      <Button type="submit">Subscribe</Button>
                  </form>
              </div>
            </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Codbbit. All rights reserved.</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
