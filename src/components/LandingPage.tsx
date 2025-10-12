
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Trophy, Code, Bot, List, Shield, GitBranch, CheckSquare, BarChart, FileCode, Users, Search, Edit, Star, Send } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { Header } from "./Header";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import Aurora from "./Aurora";


const LinePath = ({
  className,
  scrollYProgress,
}: {
  className: string;
  scrollYProgress: MotionValue<number>;
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};


export function LandingPage() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
    });
  
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

      <main ref={ref}>
        {/* Hero Section */}
        <section
            className="relative mx-auto flex h-[150vh] w-screen flex-col items-center overflow-hidden bg-background px-4 text-foreground"
            >
             <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
            <div className="mt-40 relative flex w-fit flex-col items-center justify-center gap-5 text-center">
                <h1 className="font-headline relative z-10 text-5xl font-bold tracking-tight md:text-7xl">
                 The ultimate platform <br /> for mastering <br /> Salesforce Apex
                </h1>
                <p className="font-body relative z-10 max-w-2xl text-lg font-medium text-muted-foreground">
                  Sharpen your skills, compete on leaderboards, and prepare for certifications with real-world coding challenges.
                </p>
                 <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-4 relative z-10">
                  <Button size="lg" asChild className="group">
                    <Link href="/signup">
                        Start for Free
                        <ArrowRight className="-mr-1 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                   <Button size="lg" variant="outline" asChild>
                     <Link href="/problems">Explore Problems</Link>
                   </Button>
                </div>

                <LinePath
                    className="absolute -right-[40%] top-0 z-0"
                    scrollYProgress={scrollYProgress}
                />
            </div>

            <div className="rounded-xl font-body w-full translate-y-[50vh] bg-muted/30 pb-10 text-foreground">
                <h2 className="mt-10 text-center text-[15.5vw] font-bold leading-[0.9] tracking-tighter lg:text-[16.6vw]">
                 Codbbit
                </h2>
                <div className="mt-20 flex w-full flex-col items-start gap-5 px-4 font-medium lg:mt-0 lg:flex-row lg:justify-between">
                <div className="flex w-full items-center justify-between gap-12 uppercase lg:w-fit lg:justify-center">
                    <p className="w-fit text-sm">
                    San Francisco, CA <br />
                    and online
                    </p>
                    <p className="w-fit text-right text-sm lg:text-left">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br /> The Cloud
                    </p>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-12 uppercase lg:w-fit lg:justify-center">
                    <p className="w-fit text-sm">
                    Online <br /> Free to start
                    </p>
                     <Link href="/pricing" className="w-fit text-right text-sm lg:text-left">
                        Pro Tier <br /> $15/month
                    </Link>
                </div>
                </div>
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
