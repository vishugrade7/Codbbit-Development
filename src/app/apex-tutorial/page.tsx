'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BookOpen,
  Code,
  Filter,
  SlidersHorizontal,
  GitCommit,
  Puzzle,
  Zap,
  FileJson,
  Shield,
  Telescope,
  Goal,
  TestTube2,
  Award,
  Book,
  Search,
  ChevronRight,
  Clock,
  User,
  Zap as SubtopicIcon,
  Link as LearnMoreIcon,
} from 'lucide-react';
import Link from 'next/link';

const apexTopics = [
    { 
        id: 'programming-basics', title: 'Programming Basics', Icon: BookOpen,
        subtopics: [
            { id: 'what-is-apex', title: 'What is Apex' },
            { id: 'variables', title: 'Variables' },
        ]
    },
    { 
        id: 'data-types', title: 'Data Types', Icon: Code,
        subtopics: [
            { id: 'boolean', title: 'Boolean' },
            { id: 'integer', title: 'Integer' },
            { id: 'string', title: 'String' },
            { id: 'date', title: 'Date' },
        ]
    },
    { 
        id: 'collections', title: 'Collections', Icon: Puzzle,
        subtopics: [
            { id: 'list', title: 'List' },
            { id: 'set', title: 'Set' },
            { id: 'map', title: 'Map' },
        ]
    },
    { id: 'conditional-statements', title: 'Conditional Statements', Icon: GitCommit },
    { id: 'loops', title: 'Loops', Icon: SlidersHorizontal },
    { id: 'soql', title: 'SOQL', Icon: Search },
    { id: 'dml', title: 'DML', Icon: FileJson },
    { id: 'classes-methods', title: 'Classes & Methods', Icon: Code },
    { 
        id: 'apex-triggers', title: 'Apex Triggers', Icon: Zap,
        subtopics: [
            { id: 'what-is-trigger', title: 'What is an Apex Trigger' },
            { id: 'trigger-context', title: 'Trigger Context Variables' },
            { id: 'writing-first-trigger', title: 'Writing your first trigger' },
        ]
    },
];

const learningJourney = [
    {
        title: "Data Types",
        level: "Level 1",
        description: "Learn the fundamental data types in Apex and how to work with them...",
        audience: "Beginner",
        duration: "1-2 weeks",
        subtopics: ["Boolean", "Integer", "String", "Date"],
        color: "green"
    },
    {
        title: "Collections",
        level: "Level 2",
        description: "Master different collection types and their specific use cases in Apex.",
        audience: "Beginner-Intermediate",
        duration: "2-3 weeks",
        subtopics: ["List", "Set", "Map"],
        color: "blue"
    },
    {
        title: "Conditional Statements",
        level: "Level 2",
        description: "Learn how to control program flow using various conditional statements.",
        audience: "Intermediate",
        duration: "1 week",
        subtopics: ["If-Else", "Switch Statements"],
        color: "blue"
    }
];

export default function ApexTutorialPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-72 border-r bg-background p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 font-headline">Apex</h1>
        <Accordion type="multiple" defaultValue={['programming-basics', 'data-types', 'collections', 'apex-triggers']} className="w-full">
          {apexTopics.map(({ id, title, Icon, subtopics }) => (
            <AccordionItem key={id} value={id}>
              <AccordionTrigger className="text-base font-semibold hover:no-underline py-2">
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 border-l ml-5 flex flex-col gap-1">
                    {subtopics ? subtopics.map(sub => (
                        <Link key={sub.id} href={`#${sub.id}`} className="py-1.5 text-muted-foreground hover:text-primary text-sm font-medium">
                            {sub.title}
                        </Link>
                    )) : (
                         <Link href={`#${id}`} className="py-1.5 text-muted-foreground hover:text-primary text-sm font-medium">
                            Learn {title}
                        </Link>
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
            <header>
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                    Salesforce Apex Developers Tutorial
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Salesforce, the #1 CRM platform, helps businesses of all sizes thrive. But every business has unique needs, and that's where salesforce developers come in — building custom solutions to meet those challenges.
                    <br/><br/>
                    This beginner-friendly tutorial will help you confidently take your first steps into salesforce customization using apex. Think of apex as the language of Salesforce — it's how you build, customize, and automate within the platform.
                    <br/><br/>
                    The aim of this course is to teach the essentials of Apex programming so that you can start attending interviews in three months. The following are the important topics for you to learn:
                </p>
            </header>
            
            <section className="bg-card p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-headline">Apex Learning Journey</h2>
                    <p className="text-muted-foreground mt-2">Master Salesforce Apex programming with our structured learning path</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningJourney.map((item, index) => (
                        <Card key={index} className={`bg-muted/30 border-2 ${item.color === 'green' ? 'border-green-500/30' : 'border-blue-500/30'}`}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{item.title}</CardTitle>
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${item.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{item.level}</div>
                                </div>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{item.audience}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{item.duration}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Subtopics:</h4>
                                    <ul className="space-y-2">
                                        {item.subtopics.map((sub, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <SubtopicIcon className="h-4 w-4 text-yellow-500" />
                                                <span>{sub}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button variant="link" className="p-0 h-auto text-primary">
                                    Learn more <LearnMoreIcon className="ml-1 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}
