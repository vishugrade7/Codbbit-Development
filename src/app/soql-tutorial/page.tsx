
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  Code,
  FileText,
  Filter,
  GitCommit,
  GraduationCap,
  Layers,
  Link as LinkIcon,
  List,
  Target,
} from 'lucide-react';
import Link from 'next/link';

const soqlTopics = [
  {
    title: 'SOQL Basics',
    items: ['What is SOQL', 'Basic SELECT Syntax'],
  },
  {
    title: 'Filtering Data',
    items: [
      'WHERE Clause',
      'Operators (AND, OR, NOT)',
      'Filtering on Text Fields (LIKE)',
      'Filtering on Date Literals',
    ],
  },
  {
    title: 'Ordering & Limiting',
    items: ['ORDER BY', 'LIMIT', 'OFFSET'],
  },
  {
    title: 'Relationships',
    items: [
      'Child-to-Parent (Dot Notation)',
      'Parent-to-Child (Subqueries)',
      'Semi-Joins & Anti-Joins (IN, NOT IN)',
    ],
  },
  {
    title: 'Aggregate Functions',
    items: ['COUNT()', 'SUM(), AVG(), MIN(), MAX()', 'GROUP BY', 'HAVING'],
  },
];

const learningJourney = [
  {
    title: 'SOQL Fundamentals',
    level: 1,
    description:
      'Learn the basic structure of SOQL queries to retrieve data from Salesforce objects.',
    skill: 'Beginner',
    duration: '1 week',
    subtopics: ['Basic SELECT', 'FROM clause', 'Simple WHERE'],
    color: 'green',
  },
  {
    title: 'Filtering & Ordering',
    level: 2,
    description:
      'Master how to refine your queries to get the exact data you need, in the order you want.',
    skill: 'Beginner-Intermediate',
    duration: '1 - 2 weeks',
    subtopics: ['Complex WHERE', 'ORDER BY', 'LIMIT & OFFSET'],
    color: 'blue',
  },
  {
    title: 'Relationships & Grouping',
    level: 3,
    description:
      'Explore advanced topics like querying related records and summarizing data.',
    skill: 'Intermediate',
    duration: '2 weeks',
    subtopics: ['Relationship Queries', 'Aggregate Functions', 'GROUP BY'],
    color: 'purple',
  },
];

const getBadgeColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'blue':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'purple':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
const getIconColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'text-green-500';
    case 'blue':
      return 'text-blue-500';
    case 'purple':
      return 'text-purple-500';
    default:
      return 'text-muted-foreground';
  }
};

export default function SOQLTutorialPage() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background p-6 hidden lg:block sticky top-0 h-screen">
        <h2 className="text-lg font-bold mb-4 font-headline">SOQL Tutorial</h2>
        <Accordion type="multiple" defaultValue={['SOQL Basics']}>
          {soqlTopics.map((topic) => (
            <AccordionItem key={topic.title} value={topic.title}>
              <AccordionTrigger className="text-sm font-semibold">
                {topic.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-4">
                  {topic.items.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>

      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Salesforce SOQL Developers Tutorial
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Salesforce, the #1 CRM platform, helps businesses of all sizes
            thrive. But every business has unique needs, and that's where
            salesforce developers come in — building custom solutions to meet
            those challenges.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            This beginner-friendly tutorial will help you confidently take your
            first steps into salesforce customization using SOQL. Think of
            SOQL as the language for querying Salesforce data — it's how you
            retrieve, filter, and organize information from the platform.
          </p>
          <p className="text-lg text-muted-foreground mb-12">
            The aim of this course is to teach the essentials of SOQL so
            that you can start attending interviews in three months. The
            following are the important topics for you to learn:
          </p>

          <div className="p-8 rounded-2xl dotted-bg">
            <h2 className="text-3xl font-bold text-center mb-2 font-headline">
              SOQL Learning Journey
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Master Salesforce Object Query Language with our structured
              learning path
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {learningJourney.map((item) => (
                <Card key={item.title} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle className="text-lg font-semibold">
                        {item.title}
                      </CardTitle>
                      <div
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${getBadgeColor(
                          item.color
                        )}`}
                      >
                        Level {item.level}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span>{item.skill}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Subtopics:</h4>
                      <ul className="space-y-1.5">
                        {item.subtopics.map((sub) => (
                          <li
                            key={sub}
                            className="flex items-center text-sm gap-2"
                          >
                            <Layers
                              className={`h-4 w-4 ${getIconColor(
                                item.color
                              )}`}
                            />
                            <span className="text-muted-foreground">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button variant="link" className="p-0">
                      Learn more <LinkIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
