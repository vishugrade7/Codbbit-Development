'use client';
    
import { useState, useEffect, useCallback } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Question } from '@/lib/types';


/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  refetch: () => Promise<void>;
}

/**
 * Normalizes the raw document data from Firestore to a consistent Question format.
 * @param rawData The raw data object from a Firestore document.
 * @returns A normalized Question object.
 */
function normalizeQuestionData(rawData: any): Question {
    const data = rawData as Partial<Question & { Category: string, testCases: string }>;
    return {
      id: rawData.id || '',
      title: data.title || 'Untitled Problem',
      description: data.description || '',
      difficulty: data.difficulty || 'Easy',
      tags: data.tags || [],
      examples: data.examples || [],
      hints: data.hints || [],
      starterCode: data.starterCode || '',
      category: data.category || data.Category || 'General',
      testcases: data.testcases || data.testCases || '',
    };
}


/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const fetchData = useCallback(() => {
    // If the ref is not ready, set loading and do nothing.
    if (!memoizedDocRef) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return () => {};
    }

    setIsLoading(true);
    
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          const rawData = snapshot.data();
          // Heuristic to check if the document is a question
          const isQuestion = 'title' in rawData && 'difficulty' in rawData && 'category' in rawData;
          const normalizedData = isQuestion ? normalizeQuestionData(rawData) : rawData;
          setData({ ...(normalizedData as T), id: snapshot.id });
        } else {
          // Document doesn't exist, this is not an error in itself.
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
              operation: 'get',
              path: memoizedDocRef.path,
            });
            setError(contextualError);
            errorEmitter.emit('permission-error', contextualError);
        } else {
           setError(error);
        }
        setData(null);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [memoizedDocRef]);

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => unsubscribe();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}
