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
import usePagination from '@/hooks/use-pagination';
import { Loader2, SquarePen, Trash } from 'lucide-react';
import { default as AddStudentForm } from './_components/student-dialog-form';
import { default as UpdateStudentForm } from './_components/student-dialog-form';
import DeleteDialog from '@/components/delete-dialog';
import { Student } from '@/lib/types';
import useDialog from '@/hooks/use-dialog';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function StudentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(students);

  const {
    handleOpenAdd,
    handleOpenDelete,
    handleOpenUpdate,
    openAdd,
    openDelete,
    openUpdate,
    entity,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
    handleDelete,
  } = useDialog<Student>();

  useEffect(() => {
    (() => {
      const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
        const students = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: doc.id };
        }) as Student[];
        const sortedStudents = students.sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        setStudents(sortedStudents);
        setIsLoading(false);
      });

      return () => {
        unsub();
      };
    })();
  }, []);

  return (
    <>
      <DeleteDialog
        open={openDelete}
        onClose={handleCloseDelete}
        message='Do you want to remove this student? Removing this student cannot be undone.'
        handleDelete={() => handleDelete('students', 'student')}
      />
      <AddStudentForm open={openAdd} onClose={handleCloseAdd} />
      <UpdateStudentForm
        open={openUpdate}
        onClose={handleCloseUpdate}
        student={entity}
      />
      <div className='flex flex-col w-full h-full gap-4'>
        {isLoading ? (
          <div className='flex items-center justify-center h-full w-full'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        ) : (
          <>
            <div className='flex-grow flex w-full h-full gap-2 flex-col'>
              <Button className='self-end' onClick={handleOpenAdd}>
                Add Student
              </Button>
              <div className='flex flex-col h-full'>
                <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-full'>Name</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className='font-medium'>
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2 items-center'>
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() =>
                                  handleOpenUpdate({ ...student })
                                }>
                                <SquarePen className='w-4 h-4 text-blue-400' />
                              </Button>
                              <Button
                                onClick={() => handleOpenDelete(student.id)}
                                size='icon'
                                variant='ghost'>
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
