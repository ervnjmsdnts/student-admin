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
import { SquarePen, Trash } from 'lucide-react';
import usePagination from '@/hooks/use-pagination';
import Link from 'next/link';

import { default as AddLessonForm } from './_components/lesson-dialog-form';
import { default as UpdateLessonForm } from './_components/lesson-dialog-form';
import useDialog from '@/hooks/use-dialog';
import { Lesson } from '@/lib/types';
import DeleteDialog from '@/components/delete-dialog';

const items = [
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
  { name: 'Lesson', file: 'File' },
];

export default function LessonsPage() {
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(items);

  const {
    entity,
    entityId,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
    handleOpenAdd,
    handleOpenDelete,
    handleOpenUpdate,
    openAdd,
    openDelete,
    openUpdate,
  } = useDialog<Lesson>();

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
        handleDelete={() => {}}
      />
      <div className='flex flex-col w-full h-full gap-4'>
        <div className='flex-grow flex w-full h-full gap-2 flex-col'>
          <Button className='self-end' onClick={handleOpenAdd}>
            Add Lesson
          </Button>
          <div className='flex flex-col h-full'>
            <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-1/2'>Name</TableHead>
                    <TableHead className='w-1/2'>File</TableHead>
                    <TableHead className='text-center'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>
                        {item.name} {index + 1}
                      </TableCell>
                      <TableCell className='font-medium'>
                        <Button className='p-0' variant='link' asChild>
                          <Link href='#'>
                            {item.file} {index + 1}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2 items-center'>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() =>
                              handleOpenUpdate({
                                createdAt: 0,
                                fileName: '',
                                id: index.toString(),
                                name: `${item.name} ${index + 1}`,
                                url: '',
                              })
                            }>
                            <SquarePen className='w-4 h-4 text-blue-400' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => handleOpenDelete(index.toString())}>
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
      </div>
    </>
  );
}
