'use client';

import Pagination from '@/components/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import usePagination from '@/hooks/use-pagination';
import { Score } from '@/lib/types';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function ScoresPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<Score[]>([]);
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(scores);

  useEffect(() => {
    (() => {
      const unsub = onSnapshot(collection(db, 'scores'), (snapshot) => {
        const scores = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: doc.id };
        }) as Score[];
        const sortedScores = scores.sort((a, b) => b.createdAt - a.createdAt);
        setScores(sortedScores);
        setIsLoading(false);
      });

      return () => {
        unsub();
      };
    })();
  }, []);

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      {isLoading ? (
        <div className='w-full h-full flex justify-center items-center'>
          <Loader2 className='w-6 h-6 animate-spin' />
        </div>
      ) : (
        <>
          <div className='flex-grow flex w-full h-full gap-2 flex-col'>
            <div className='flex flex-col h-full'>
              <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Quiz Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className='font-medium'>
                          {score.studentName}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {score.quizName}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {score.score}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {score.subject.charAt(0).toUpperCase() +
                            score.subject.slice(1)}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {score.type}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {format(score.createdAt, 'Pp')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className='self-end'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          </div>
        </>
      )}
    </div>
  );
}
