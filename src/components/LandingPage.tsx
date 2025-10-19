
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Trophy, Code, Bot, List, Shield, GitBranch, CheckSquare, BarChart, FileCode, Users, Search, Edit, Star, Send } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import BlurText from "./ui/BlurText";
import ShinyText from "./ui/ShinyText";
import RotatingText from "./ui/RotatingText";
import { cn } from "@/lib/utils";
import './ui/ScrollingTestimonials.css';

const FeatureSection = ({ feature, index }: { feature: any; index: number }) => {
  const isOdd = index % 2 !== 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
    >
      <div className={cn("space-y-4", isOdd && "md:order-2")}>
        <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                {feature.icon}
            </div>
            <h3 className="text-2xl font-bold font-headline">{feature.title}</h3>
        </div>
        <p className="text-lg text-muted-foreground">{feature.description}</p>
      </div>
      <motion.div 
        className={cn("rounded-xl bg-muted/20 p-2 ring-1 ring-inset ring-muted/30 lg:p-4", isOdd && "md:order-1")}
        initial={{ opacity: 0, x: isOdd ? -100 : 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 90, damping: 20 }}
      >
        <Image
          src={`/image ${index + 2}.png`}
          alt={feature.title}
          width={1200}
          height={800}
          className="rounded-md shadow-lg ring-1 ring-muted/20"
        />
      </motion.div>
    </motion.div>
  );
};


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
        icon: <Users className="h-8 w-8 text-primary" />,
        title: 'Realistic Interview Prep',
        description:
          'Solve problems that mirror what you\'ll face in technical interviews for Salesforce developer roles.',
      },
    ];

    const testimonials = [
        { name: "John Doe", title: "Salesforce Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", text: "Codbbit has been a game-changer for my interview prep. The problems are realistic and the real-time execution environment is invaluable." },
        { name: "Jane Smith", title: "Senior Apex Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e", text: "The AI assistant is amazing. It helps me understand concepts without just giving me the answer. My coding has improved so much." },
        { name: "Sam Adams", title: "Salesforce Technical Architect", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f", text: "I love the problem sheets. I can focus on specific areas where I need to improve, like asynchronous Apex or SOQL performance." },
        { name: "Emily White", title: "Salesforce Consultant", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705a", text: "The leaderboard is a great motivator. It's fun to compete with other developers and see my progress." },
        { name: "Michael Brown", title: "Junior Salesforce Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705b", text: "As someone new to Salesforce, Codbbit has been an incredible learning tool. The examples are clear and the feedback is instant." },
        { name: "Sarah Green", title: "Salesforce Admin & Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705c", text: "The variety of problems is fantastic. It covers everything from basic Apex to complex trigger scenarios." },
        { name: "David Black", title: "Freelance Salesforce Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", text: "I recommend Codbbit to all my students. It's the best platform for hands-on Apex practice." },
        { name: "Laura Blue", title: "Salesforce Platform Champion", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705e", text: "The secure org integration gives me confidence that I'm practicing in a safe and realistic environment." },
        { name: "Chris Yellow", title: " aspiring Salesforce Developer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705f", text: "The community is great. It's helpful to see how others approach the same problem." },
        { name: "Olivia Purple", title: "Salesforce MVP", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706a", text: "Codbbit is an essential tool for any serious Salesforce developer. It keeps my skills sharp." },
        { name: "Daniel Red", title: "Lead Salesforce Engineer", avatar: "https://i.pravatar.cc/150?u=a_042581f4e29026706b", text: "The AI-generated hints are a lifesaver. They guide you in the right direction without spoiling the challenge." },
        { name: "Sophia Orange", title: "Certified Technical Architect", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706c", text: "This is the platform I wish I had when I was starting my CTA journey. It's simply brilliant." },
    ];
    
    // Duplicate testimonials for a seamless loop
    const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="bg-background text-foreground antialiased">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-x-clip bg-background py-20 md:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_45rem_at_50%_100%,hsl(var(--primary)/0.1),transparent)]" aria-hidden="true"></div>
          <div className="container mx-auto px-4 z-10">
            <div className="mx-auto max-w-3xl text-center">
               <div className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl flex flex-wrap items-center justify-center gap-x-2 gap-y-0">
                <BlurText
                  text="Master Salesforce"
                  delay={100}
                  animateBy="words"
                  className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                />
                 <RotatingText
                    texts={['Apex', 'SOQL', 'LWC']}
                    mainClassName="px-2 sm:px-2 md:px-3 bg-primary text-primary-foreground overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg text-4xl sm:text-5xl md:text-6xl"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
              </div>
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
                <Button asChild className="h-10 px-6 text-sm md:h-11 md:px-8 md:text-base">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
              className="relative mt-16 flow-root sm:mt-24 max-w-4xl mx-auto"
            >
              <div className="relative -m-2 rounded-xl bg-muted/20 p-2 ring-1 ring-inset ring-muted/30 lg:-m-4 lg:rounded-2xl lg:p-4">
                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Image
                    src="/image 1.png"
                    alt="App screenshot"
                    width={2432}
                    height={1442}
                    className="rounded-md shadow-2xl ring-1 ring-muted/20"
                    priority
                    />
                </motion.div>
                 <motion.div 
                    className="absolute -left-4 -top-8 sm:-left-12 sm:-top-24 w-24 h-24 md:w-48 md:h-48 -z-10"
                    animate={{ y: [0, -15, 0], rotate: [10, 5, 10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                 >
                   <Image src="/logo.png" alt="Codbbit Owl Mascot" width={200} height={200} className="drop-shadow-lg" />
                 </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
              A smarter way to practice Apex
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              We've built a comprehensive platform to give you the tools and practice you need to excel.
            </p>
          </div>
          <div className="mt-20 space-y-24">
            {features.map((feature, index) => (
              <FeatureSection key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="bg-muted/20 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What developers are saying</h2>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Thousands of developers use Codbbit to sharpen their Apex skills.
                    </p>
                </div>
            </div>
            <div className="scrolling-testimonials-container mt-16">
                <div className="scrolling-testimonials">
                    {duplicatedTestimonials.map((testimonial, index) => (
                        <Card key={index} className="testimonial-card">
                            <CardContent className="pt-6">
                                <p className="italic">"{testimonial.text}"</p>
                            </CardContent>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} />
                                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
