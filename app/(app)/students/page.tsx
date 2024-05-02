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
import { SquarePen, Trash } from 'lucide-react';
import { default as AddStudentForm } from './_components/student-dialog-form';
import { default as UpdateStudentForm } from './_components/student-dialog-form';
import DeleteDialog from '@/components/delete-dialog';
import { Student } from '@/lib/types';
import useDialog from '@/hooks/use-dialog';

const items = [
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
  { name: 'Student' },
];

export default function StudentsPage() {
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(items);

  const {
    handleOpenAdd,
    handleOpenDelete,
    handleOpenUpdate,
    openAdd,
    openDelete,
    openUpdate,
    entity,
    entityId,
    handleCloseAdd,
    handleCloseDelete,
    handleCloseUpdate,
  } = useDialog<Student>();

  return (
    <>
      <DeleteDialog
        open={openDelete}
        onClose={handleCloseDelete}
        message='Do you want to remove this student? Removing this student cannot be undone.'
        handleDelete={() => {}}
      />
      <AddStudentForm open={openAdd} onClose={handleCloseAdd} />
      <UpdateStudentForm
        open={openUpdate}
        onClose={handleCloseUpdate}
        student={entity}
      />
      <div className='flex flex-col w-full h-full gap-4'>
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
                  {currentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>
                        {item.name} {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2 items-center'>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() =>
                              handleOpenUpdate({
                                name: `${item.name} ${index + 1}`,
                                id: index.toString(),
                                nameInput: item.name
                                  .split(' ')
                                  .join('')
                                  .toLowerCase(),
                                createdAt: 1,
                              })
                            }>
                            <SquarePen className='w-4 h-4 text-blue-400' />
                          </Button>
                          <Button
                            onClick={() => handleOpenDelete('jifodajfioda')}
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
      </div>
    </>
  );
}
