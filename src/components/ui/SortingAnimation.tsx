
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import './SortingAnimation.css';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
}

const sampleProblems: Problem[] = [
  { id: 1, title: "Two Sum", difficulty: 'Easy' },
  { id: 2, title: "Validate Subsequence", difficulty: 'Easy' },
  { id: 3, title: "Three Number Sum", difficulty: 'Medium' },
  { id: 4, title: "Water Area", difficulty: 'Hard' },
  { id: 5, title: "Move Element To End", difficulty: 'Medium' },
  { id: 6, title: "First Duplicate Value", difficulty: 'Medium' },
  { id: 7, title: "Staircase Traversal", difficulty: 'Easy' },
  { id: 8, title: "Min Height BST", difficulty: 'Medium' },
  { id: 9, title: "Invert Binary Tree", difficulty: 'Easy' },
  { id: 10, title: "Max Subset Sum", difficulty: 'Hard' },
  { id: 11, title: "Branch Sums", difficulty: 'Easy' },
  { id: 12, title: "Four Number Sum", difficulty: 'Hard' },
];

const getDifficultyClass = (difficulty: Difficulty) => {
    switch (difficulty) {
        case 'Easy': return 'problem-card-easy';
        case 'Medium': return 'problem-card-medium';
        case 'Hard': return 'problem-card-hard';
    }
}

const getPosition = (index: number, total: number) => {
    const cardHeight = 40; // height of a card in pixels
    const gap = 12; // gap between cards in pixels
    const totalHeight = total * cardHeight + (total - 1) * gap;
    const yOffset = (450 - totalHeight) / 2; // 450 is the grid height

    return { 
        x: '50%',
        y: yOffset + index * (cardHeight + gap)
    };
};


export function SortingAnimation() {
  const [sortBy, setSortBy] = useState<Difficulty | 'All'>('All');
  const filters: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    const interval = setInterval(() => {
      setSortBy(prevSortBy => {
        const currentIndex = filters.indexOf(prevSortBy);
        const nextIndex = (currentIndex + 1) % filters.length;
        return filters[nextIndex];
      });
    }, 2000); // Change filter every 2 seconds

    return () => clearInterval(interval);
  }, []);


  const sortedProblems = useMemo(() => {
    if (sortBy === 'All') {
      return [...sampleProblems].sort((a, b) => a.id - b.id);
    }
    return [...sampleProblems].sort((a, b) => {
      if (a.difficulty === sortBy && b.difficulty !== sortBy) return -1;
      if (a.difficulty !== sortBy && b.difficulty === sortBy) return 1;
      return a.id - b.id;
    });
  }, [sortBy]);

  return (
    <div className="sorting-animation-container">
        <div className="problem-grid">
            <AnimatePresence>
            {sortedProblems.map((problem, index) => {
                const isFilteredOut = sortBy !== 'All' && problem.difficulty !== sortBy;
                const { x, y } = getPosition(index, sortedProblems.length);
                
                return (
                    <motion.div
                        key={problem.id}
                        layout
                        initial={{ opacity: 0, scale: 0.5, x: '50%' }}
                        animate={{ opacity: isFilteredOut ? 0.3 : 1, scale: 1, x, y }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="problem-card-wrapper"
                        style={{
                            transform: 'translateX(-50%)' // Center horizontally
                        }}
                    >
                        <div className={cn("problem-card", getDifficultyClass(problem.difficulty))}>
                            <span>{problem.title}</span>
                            <Badge variant="outline" className="border-current/50">{problem.difficulty}</Badge>
                        </div>
                    </motion.div>
                );
            })}
            </AnimatePresence>
        </div>
    </div>
  );
}
