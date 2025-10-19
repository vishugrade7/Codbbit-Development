
'use client';

import { useEffect, useState } from 'react';
import './CodeExecutionAnimation.css';
import { cn } from '@/lib/utils';

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

export function CodeExecutionAnimation() {
    const [lines, setLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState(0);

    useEffect(() => {
        const typingInterval = setInterval(() => {
            if (currentLine < apexCode.length) {
                setLines(prev => [...prev, apexCode[currentLine]]);
                setCurrentLine(prev => prev + 1);
            } else {
                clearInterval(typingInterval);
                 setTimeout(() => {
                    setCurrentLine(0);
                    setLines([]);
                }, 3000);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, [currentLine]);
    
    return (
        <div className="code-animation-container">
            <div className="code-editor">
                <div className="code-header">
                    <div className="code-buttons">
                        <span className="code-button-red"></span>
                        <span className="code-button-yellow"></span>
                        <span className="code-button-green"></span>
                    </div>
                    <div className="code-title">MergeSort.cls</div>
                </div>
                <div className="code-body">
                    {lines.map((line, index) => (
                        <div key={index} className="code-line">
                            <span className="line-number">{index + 1}</span>
                            <pre className={cn(index === currentLine - 1 && "typing")}>
                                {line}
                            </pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

