
'use client';

import { useEffect, useState, useRef } from 'react';
import './CodeExecutionAnimation.css';
import { cn } from '@/lib/utils';
import { Confetti } from '../Confetti';

const apexCode = `
public class MergeSort {
    public static List<Integer> sort(List<Integer> arr) {
        if (arr.size() <= 1) {
            return arr;
        }
        
        Integer middle = arr.size() / 2;
        List<Integer> left = new List<Integer>();
        List<Integer> right = new List<Integer>();
        
        for (Integer i = 0; i < middle; i++) {
            left.add(arr.get(i));
        }
        for (Integer i = middle; i < arr.size(); i++) {
            right.add(arr.get(i));
        }
        
        left = sort(left);
        right = sort(right);
        
        return merge(left, right);
    }
    
    private static List<Integer> merge(List<Integer> left, List<Integer> right) {
        List<Integer> result = new List<Integer>();
        Integer leftIndex = 0;
        Integer rightIndex = 0;
        
        while (leftIndex < left.size() && rightIndex < right.size()) {
            if (left.get(leftIndex) < right.get(rightIndex)) {
                result.add(left.get(leftIndex));
                leftIndex++;
            } else {
                result.add(right.get(rightIndex));
                rightIndex++;
            }
        }
        
        while (leftIndex < left.size()) {
            result.add(left.get(leftIndex));
            leftIndex++;
        }
        while (rightIndex < right.size()) {
            result.add(right.get(rightIndex));
            rightIndex++;
        }
        
        return result;
    }
}
`.trim().split('\n');


function highlightSyntax(line: string) {
    const keywords = ['public', 'static', 'if', 'return', 'for', 'while', 'new', 'private', 'else'];
    const types = ['List<Integer>', 'Integer', 'void', 'boolean'];
    
    // Create a regex that matches keywords, types, method calls, strings, and numbers
    const parts = line.split(/(\b(?:public|static|if|return|for|while|new|private|else)\b|\b(?:List<Integer>|Integer|void|boolean)\b|\b\w+(?=\s*\()|'.*?'|"[^"]*"|\b\d+\b)/g);

    return parts.map((part, index) => {
        if (keywords.includes(part)) {
            return <span key={index} className="token-keyword">{part}</span>;
        }
        if (types.includes(part)) {
            return <span key={index} className="token-type">{part}</span>;
        }
        if (/\b\w+(?=\s*\()/.test(part) && !keywords.includes(part) && !types.includes(part)) {
             // Check if it's a method call that is not a keyword or type
            if(line.includes(`${part}(`)){
                return <span key={index} className="token-method">{part}</span>;
            }
        }
        if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
            return <span key={index} className="token-string">{part}</span>;
        }
        if (!isNaN(Number(part)) && part.trim() !== '') {
            return <span key={index} className="token-number">{part}</span>
        }
        return <span key={index} className="token-default">{part}</span>;
    });
}

export function CodeExecutionAnimation() {
    const [lines, setLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const codeBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const typingInterval = setInterval(() => {
            if (currentLine < apexCode.length) {
                setLines(prev => [...prev, apexCode[currentLine]]);
                setCurrentLine(prev => prev + 1);
            } else {
                clearInterval(typingInterval);
                setShowConfetti(true);
                 setTimeout(() => {
                    setShowConfetti(false);
                    setCurrentLine(0);
                    setLines([]);
                }, 3000);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, [currentLine]);

    useEffect(() => {
        if (codeBodyRef.current) {
            codeBodyRef.current.scrollTop = codeBodyRef.current.scrollHeight;
        }
    }, [lines]);
    
    return (
        <div className="code-animation-container">
            {showConfetti && <Confetti />}
            <div className="code-editor">
                <div className="code-header">
                    <div className="code-buttons">
                        <span className="code-button-red"></span>
                        <span className="code-button-yellow"></span>
                        <span className="code-button-green"></span>
                    </div>
                    <div className="code-title">MergeSort.cls</div>
                </div>
                <div className="code-body" ref={codeBodyRef}>
                    {lines.map((line, index) => (
                        <div key={index} className="code-line">
                            <span className="line-number">{index + 1}</span>
                            <div className="code-content">
                                {highlightSyntax(line)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
