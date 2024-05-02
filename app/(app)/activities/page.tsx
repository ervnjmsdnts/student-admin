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

const items = [
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
  { name: 'Activity' },
];

export default function ActivitiesPage() {
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(items);

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <div className='flex-grow flex w-full h-full gap-2 flex-col'>
        <Button className='self-end'>Add Activity</Button>
        <div className='flex flex-col h-full'>
          <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-1/2'>Name</TableHead>
                  <TableHead className='w-1/2'>Number of Questions</TableHead>
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
                        <Link href='#'>{index + 1}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2 items-center'>
                        <Button size='icon' variant='ghost'>
                          <SquarePen className='w-4 h-4 text-blue-400' />
                        </Button>
                        <Button size='icon' variant='ghost'>
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
  );
}
