
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Trophy, Code, Bot, List, Shield, GitBranch, CheckSquare, BarChart, FileCode, Users, Search, Edit, Star, Send, Check, Sheet } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Input } from "./ui/input";
import BlurText from "./ui/BlurText";
import RotatingText from "./ui/RotatingText";
import './ui/RotatingText.css';
import { cn, getCategoryColorClasses } from "@/lib/utils";
import './ui/ScrollingTestimonials.css';
import { useRef } from "react";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { useTheme } from "@/components/ThemeProvider";
import { CodeExecutionAnimation } from "./ui/CodeExecutionAnimation";


export function LandingPage() {
  const { theme } = useTheme();
  const heroImageLight = getPlaceholderImage('hero-light');
  const heroImageDark = getPlaceholderImage('hero-dark');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const features = [
      {
        icon: <Trophy className="h-6 w-6 text-primary" />,
        title: 'Competitive Leaderboards',
        description: "See how you stack up against other Salesforce developers. Climb the ranks by solving problems and earning points. Compete globally or within your company.",
        points: [
            "Track your progress and ranking.",
            "Compete with developers worldwide.",
            "Filter leaderboards by country or company.",
        ],
        avatars: [
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026704d", alt: "User 1", className: "h-32 w-32 top-[20%] left-[5%]", rank: 4, points: 1250 },
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026704e", alt: "User 2", className: "h-36 w-36 top-[10%] left-[40%]", rank: 1, points: 2500 },
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026704f", alt: "User 3", className: "h-24 w-24 top-0 right-[15%]", rank: 3, points: 1500 },
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026705a", alt: "User 4", className: "h-32 w-32 bottom-0 right-[30%]", rank: 5, points: 1100 },
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026705b", alt: "User 5", className: "h-28 w-28 top-[45%] right-0", rank: 2, points: 1800 },
            { src: "https://i.pravatar.cc/150?u=a042581f4e29026705c", alt: "User 6", className: "h-20 w-20 bottom-[10%] left-[20%]", rank: 6, points: 950 },
        ]
      },
      {
        icon: <List className="h-6 w-6 text-primary" />,
        title: 'Problem Categories & Difficulty',
        description: "Choose from a wide range of categories like Apex Triggers, SOQL, and Asynchronous Apex. Filter problems by difficulty to match your skill level, from Easy to Hard.",
        points: [
            "Diverse categories for targeted practice.",
            "Problems for all skill levels.",
            "Master specific Salesforce development areas.",
        ],
        imageSrc: "/problems.png"
      },
      {
        icon: <Code className="h-6 w-6 text-primary" />,
        title: 'Real-time Code Execution',
        description: "Execute Apex code against a real Salesforce org and get immediate feedback, just like in a real-world scenario. No more waiting, just coding.",
        points: [
            "Instantly run Apex code.",
            "Connect securely to any Salesforce org.",
            "Get real-time results and debug logs.",
        ],
        animation: <CodeExecutionAnimation />,
      },
      {
        icon: <Sheet className="h-6 w-6 text-primary" />,
        title: 'Curated Problem Sheets',
        description: "Follow structured learning paths with curated problem sheets. These sheets group problems by topic or company-specific interview questions, helping you focus your practice.",
        points: [
            "Follow sheets created by experts.",
            "Track your progress through a sheet.",
            "Prepare for specific company interviews.",
        ],
        problemSheets: [
          { name: 'Top 50 Apex Questions', count: 50 },
          { name: 'Salesforce Interview Prep', count: 75 },
          { name: 'Async Apex Mastery', count: 25 },
          { name: 'SOQL Zero to Hero', count: 30 },
          { name: 'Trigger Frameworks', count: 20 },
          { name: 'LWC Best Practices', count: 40 },
        ]
      }
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
    
    const duplicatedTestimonials = [...testimonials, ...testimonials];

    const faqs = [
      {
        question: "What is Codbbit and who is it for?",
        answer:
          "Codbbit is a platform for Salesforce developers to practice and improve their Apex coding skills. It's for developers of all levels, from beginners learning Apex to experienced pros preparing for technical interviews and certifications.",
      },
      {
        question: "How does the AI assistant help me?",
        answer:
          "Our AI assistant, Codbee, acts as your personal tutor. If you're stuck on a problem, you can ask for a hint. It will analyze your code and provide guidance to help you find the solution yourself, rather than just giving you the answer.",
      },
      {
        question: "Do I need my own Salesforce Org?",
        answer:
          "Yes, you will need to connect your own free Salesforce Developer Edition org. This allows you to execute code in a real, live environment, which is the best way to practice. Codbbit securely deploys and runs code using the Tooling API.",
      },
       {
        question: "Is Codbbit free to use?",
        answer:
          "Yes, Codbbit offers a generous free tier that includes access to a wide range of problems and core features. We also have a Premium plan with advanced features like the AI assistant and exclusive problem sets.",
      },
    ];
    
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 0.8]
  );
  
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -5]
  );


  return (
    <div className="bg-background text-foreground antialiased">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-x-clip bg-background py-20 md:py-32">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" aria-hidden="true"></div>
          <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(farthest-side,white,transparent)] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22none%22%20stroke%3D%22hsl(var(--border))%22%3E%3Cpath%20d%3D%22M0%20.5%20L32%20.5%20M.5%200%20L.5%2032%22%2F%3E%3C%2Fsvg%3E')]" aria-hidden="true"></div>
          <div className="container mx-auto px-4 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="max-w-xl text-center md:text-left">
                 <BlurText
                    text="Master Salesforce"
                    className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
                    delay={0.1}
                />
                <h1
                  className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
                >
                   <RotatingText texts={['SOQL', 'Apex', 'LWC']} />
                </h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 text-lg leading-8 text-muted-foreground"
                >
                  The ultimate platform for mastering Salesforce Apex. Sharpen your skills, compete on leaderboards, and prepare for certifications with real-world coding challenges and an AI-powered assistant.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-10 flex items-center justify-center md:justify-start gap-x-6"
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
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                className="relative flow-root"
              >
                <div className="relative -m-2 rounded-xl bg-muted/20 p-2 ring-1 ring-inset ring-muted/30 lg:-m-4 lg:rounded-2xl lg:p-4">
                  {heroImageLight && (
                    <Image
                      src={heroImageLight.imageUrl}
                      alt={heroImageLight.description}
                      width={1200}
                      height={800}
                      className={cn("rounded-md shadow-2xl ring-1 ring-muted/20", theme === 'dark' && 'hidden')}
                      priority
                      data-ai-hint={heroImageLight.imageHint}
                    />
                  )}
                  {heroImageDark && (
                    <Image
                      src={heroImageDark.imageUrl}
                      alt={heroImageDark.description}
                      width={1200}
                      height={800}
                      className={cn("rounded-md shadow-2xl ring-1 ring-muted/20", theme === 'light' && 'hidden')}
                      priority
                      data-ai-hint={heroImageDark.imageHint}
                    />
                  )}
                  <div className="absolute -z-10 -left-4 -top-4 sm:-left-8 sm:-top-8 w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48">
                    <Image src="/logo.png" alt="Codbbit Owl Mascot" width={200} height={200} className="drop-shadow-lg animate-wiggle" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <div ref={ref} className="relative z-10">
          {features.map((feature, i) => {
            const targetScale = 1 - ((features.length - i) * 0.05);
            return (
              <motion.div
                key={i}
                className="sticky top-0"
                style={{
                  scale,
                  rotate,
                  top: `${'i * 2.5'}rem`,
                }}
              >
                 <div className="relative h-[80vh] rounded-2xl border border-border/20 bg-card p-8 md:p-12 overflow-hidden dotted-bg">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/80 to-background" />
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                {feature.icon}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-headline">{feature.title}</h2>
                            <p className="text-muted-foreground text-lg">
                                {feature.description}
                            </p>
                            <ul className="space-y-4">
                                {feature.points.map((text, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-primary bg-primary/10 rounded-full p-1" />
                                        <span className="text-foreground">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative min-h-[300px]">
                            {feature.avatars && feature.avatars.map((avatar, avatarIndex) => (
                                <motion.div 
                                    key={avatarIndex}
                                    initial={{ scale: 0.8, opacity: 0 }} 
                                    whileInView={{ scale: 1, opacity: 1 }} 
                                    transition={{ duration: 0.5, delay: 0.2 + avatarIndex * 0.1 }} 
                                    className={cn("absolute", avatar.className)}
                                >
                                    <div className="relative group">
                                        <Avatar className="h-full w-full border-4 border-background">
                                            <AvatarImage src={avatar.src} alt={avatar.alt} />
                                            <AvatarFallback>{avatar.alt.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-primary text-primary-foreground rounded-full h-auto flex items-center justify-center text-xs font-bold border-2 border-background transition-opacity duration-300">
                                          <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                              <Trophy className="h-3 w-3 text-yellow-300" />
                                              <span>Rank {avatar.rank}</span>
                                            </div>
                                            <div className="h-3 w-px bg-primary-foreground/50"></div>
                                            <span>{avatar.points}pts</span>
                                          </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                             {feature.imageSrc && (
                                <Image
                                    src={feature.imageSrc}
                                    alt={feature.title}
                                    width={600}
                                    height={400}
                                    className="rounded-md shadow-2xl ring-1 ring-muted/20"
                                />
                            )}
                            {feature.animation && (
                              feature.animation
                            )}
                            {feature.problemSheets && (
                                <div className="space-y-4">
                                  {feature.problemSheets.map((sheet, sheetIndex) => {
                                      const colorClasses = getCategoryColorClasses(sheetIndex);
                                      return (
                                        <motion.div
                                          key={sheet.name}
                                          initial={{ opacity: 0, x: 50 }}
                                          whileInView={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.5, delay: 0.2 + sheetIndex * 0.1 }}
                                        >
                                          <Card className={cn(colorClasses.card, "backdrop-blur-xl")}>
                                            <CardHeader className="flex flex-row items-center justify-between p-6">
                                              <CardTitle className="text-base font-semibold">{sheet.name}</CardTitle>
                                              <span className="text-sm font-medium text-muted-foreground">{sheet.count} Problems</span>
                                            </CardHeader>
                                          </Card>
                                        </motion.div>
                                      );
                                  })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </motion.div>
            );
          })}
        </div>


        {/* Testimonials Section */}
        <section className="bg-muted/20 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">What developers are saying</h2>
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

        {/* FAQ Section */}
        <section className="bg-blue-50/50 dark:bg-blue-900/10 py-16">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
                      Frequently Asked Questions
                  </h2>
                  <p className="text-lg text-muted-foreground">
                      Explore quick answers to common questions about Codbbit, our AI-powered platform for Salesforce developers.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
              </div>
              <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

    