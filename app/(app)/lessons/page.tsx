'use client';

import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Loader2, SquarePen, Trash } from 'lucide-react';
import usePagination from '@/hooks/use-pagination';
import Link from 'next/link';

import { default as AddLessonForm } from './_components/lesson-dialog-form';
import { default as UpdateLessonForm } from './_components/lesson-dialog-form';
import useDialog from '@/hooks/use-dialog';
import { Lesson } from '@/lib/types';
import DeleteDialog from '@/components/delete-dialog';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LessonsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>(
    undefined,
  );

  const sortedLessons =
    selectedQuarter === 'all' || selectedQuarter === undefined
      ? lessons
      : lessons.filter((les) => les.type === selectedQuarter);

  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(sortedLessons);

  const {
    entity,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
    handleOpenAdd,
    handleOpenDelete,
    handleOpenUpdate,
    openAdd,
    openDelete,
    openUpdate,
    handleDelete,
  } = useDialog<Lesson>();

  useEffect(() => {
    (() => {
      const unsub = onSnapshot(collection(db, 'lessons'), (snapshot) => {
        const lessons = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: doc.id };
        }) as Lesson[];
        const sortedLessons = lessons.sort((a, b) => b.createdAt - a.createdAt);
        setLessons(sortedLessons);
        setIsLoading(false);
      });

      return () => {
        unsub();
      };
    })();
  }, []);

  return (
    <>
      <AddLessonForm open={openAdd} onClose={handleCloseAdd} />
      <UpdateLessonForm
        open={openUpdate}
        onClose={handleCloseUpdate}
        lesson={entity}
      />
      <DeleteDialog
        open={openDelete}
        onClose={handleCloseDelete}
        message='Do you want to remove this lesson? Removing this lesson cannot be undone.'
        handleDelete={() => handleDelete('lessons', 'lesson')}
      />
      <div className='flex flex-col w-full h-full gap-4'>
        {isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        ) : (
          <>
            <div className='flex-grow flex w-full h-full gap-2 flex-col'>
              <div className='flex items-center justify-between'>
                <Select
                  value={selectedQuarter}
                  defaultValue='all'
                  onValueChange={(value) => setSelectedQuarter(value)}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter quarter' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Quarters</SelectItem>
                    <SelectItem value='1st'>1st Quarter</SelectItem>
                    <SelectItem value='2nd'>2nd Quarter</SelectItem>
                    <SelectItem value='3rd'>3rd Quarter</SelectItem>
                    <SelectItem value='4th'>4th Quarter</SelectItem>
                  </SelectContent>
                </Select>
                <Button className='' onClick={handleOpenAdd}>
                  Add Lesson
                </Button>
              </div>
              <div className='flex flex-col h-full'>
                <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-1/4'>Name</TableHead>
                        <TableHead className='w-1/4'>File</TableHead>
                        <TableHead className='w-1/4'>Subject</TableHead>
                        <TableHead className='w-1/4'>Quarter</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className='font-medium'>
                            {lesson.name}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {lesson.fileName && lesson.url && (
                              <Button className='p-0' variant='link' asChild>
                                <Link target='_blank' href={lesson.url}>
                                  <FileText className='mr-2 w-4 h-4' />{' '}
                                  {lesson.fileName}
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {lesson.subject.charAt(0).toUpperCase() +
                              lesson.subject.slice(1)}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {lesson.type.charAt(0).toUpperCase() +
                              lesson.type.slice(1)}
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2 items-center'>
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => handleOpenUpdate({ ...lesson })}>
                                <SquarePen className='w-4 h-4 text-blue-400' />
                              </Button>
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => handleOpenDelete(lesson.id)}>
                                <Trash className='w-4 h-4 text-red-400' />
                              </Button>
                            </div>
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
    </>
  );
}
