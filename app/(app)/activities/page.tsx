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
import { Loader2, SquarePen, Trash } from 'lucide-react';
import usePagination from '@/hooks/use-pagination';
import { default as AddActivityForm } from './_components/activity-dialog-form';
import { default as UpdateActivityForm } from './_components/activity-dialog-form';
import useDialog from '@/hooks/use-dialog';
import { Activity } from '@/lib/types';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DeleteDialog from '@/components/delete-dialog';

export default function ActivitiesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { currentItems, currentPage, paginate, totalPages } =
    usePagination(activities);

  const {
    handleCloseAdd,
    handleOpenAdd,
    openAdd,
    entity,
    handleOpenUpdate,
    openUpdate,
    handleCloseUpdate,
    handleCloseDelete,
    openDelete,
    handleOpenDelete,
    handleDelete,
  } = useDialog<Activity>();

  useEffect(() => {
    (() => {
      const unsub = onSnapshot(collection(db, 'activities'), (snapshot) => {
        const activities = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: doc.id };
        }) as Activity[];
        const sortedActivities = activities.sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        setActivities(sortedActivities);
        setIsLoading(false);
      });

      return () => {
        unsub();
      };
    })();
  }, []);

  return (
    <>
      <AddActivityForm open={openAdd} onClose={handleCloseAdd} />
      <UpdateActivityForm
        open={openUpdate}
        onClose={handleCloseUpdate}
        activity={entity}
      />
      <DeleteDialog
        open={openDelete}
        onClose={handleCloseDelete}
        message='Do you want to remove this activity? Removing this activity cannot be undone.'
        handleDelete={() => handleDelete('activities', 'activity')}
      />
      <div className='flex flex-col w-full h-full gap-4'>
        {isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        ) : (
          <>
            <div className='flex-grow flex w-full h-full gap-2 flex-col'>
              <Button className='self-end' onClick={handleOpenAdd}>
                Add Activity
              </Button>
              <div className='flex flex-col h-full'>
                <div className='border rounded-lg w-full h-0 flex-grow overflow-y-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-1/4'>Name</TableHead>
                        <TableHead className='w-1/4'>
                          Number of Questions
                        </TableHead>
                        <TableHead className='w-1/4'>Subject</TableHead>
                        <TableHead className='w-1/4'>Type</TableHead>
                        <TableHead className='text-center'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>
                            {activity.name}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {activity.questions.length}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {activity.subject.charAt(0).toUpperCase() +
                              activity.subject.slice(1)}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {activity.type.charAt(0).toUpperCase() +
                              activity.type.slice(1)}
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2 items-center'>
                              <Button
                                onClick={() =>
                                  handleOpenUpdate({ ...activity })
                                }
                                size='icon'
                                variant='ghost'>
                                <SquarePen className='w-4 h-4 text-blue-400' />
                              </Button>
                              <Button
                                onClick={() => handleOpenDelete(activity.id)}
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
