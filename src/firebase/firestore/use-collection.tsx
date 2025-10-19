
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Question } from '@/lib/types';
import { getProblemsFromDB, saveProblemsToDB } from '@/lib/indexed-db';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  refetch: () => void;
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
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
      category: data.category || 'General',
      examples: data.examples || [],
      hints: data.hints || [],
      starterCode: data.starterCode || '',
      testcases: data.testcases || data.testCases || '',
    };
}


/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 *
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  const isProblemsCollection = memoizedTargetRefOrQuery?.type === 'collection' && (memoizedTargetRefOrQuery as CollectionReference).path === 'problems';

  const fetchData = () => {
    if (!memoizedTargetRefOrQuery) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return () => {}; // Return an empty unsubscribe function
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results = snapshot.docs.map(doc => {
          const rawData = doc.data();
          // Heuristic to check if the document is a question
          const isQuestion = 'title' in rawData && 'difficulty' in rawData && 'category' in rawData;
          const normalizedData = isQuestion ? normalizeQuestionData(rawData) : rawData;
          return { ...normalizedData, id: doc.id } as ResultItemType;
        });

        setData(results);
        setError(null);
        setIsLoading(false);

        if (isProblemsCollection) {
            saveProblemsToDB(results);
        }
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          const path: string =
            memoizedTargetRefOrQuery.type === 'collection'
              ? (memoizedTargetRefOrQuery as CollectionReference).path
              : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          })

          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
          setError(error);
        }
        setData(null)
        setIsLoading(false)
      }
    );

    return unsubscribe;
  }

  useEffect(() => {
    let unsubscribe = () => {};
    
    async function loadData() {
        if (isProblemsCollection) {
            setIsLoading(true);
            const cachedProblems = await getProblemsFromDB();
            if (cachedProblems) {
                setData(cachedProblems as StateDataType);
                setIsLoading(false);
            }
        }
        // Always subscribe to Firestore for real-time updates
        unsubscribe = fetchData();
    }
    
    loadData();

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  const refetch = () => {
    fetchData();
  };
  
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }
  return { data, isLoading, error, refetch };
}
