'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type StudentForm = {
  student?: Student;
  open: boolean;
  onClose: () => void;
};

const schema = z.object({
  name: z
    .string({ required_error: 'Field is required' })
    .min(1, 'Field is required'),
});

type FormData = z.infer<typeof schema>;

export default function StudentDialogForm({
  student,
  open,
  onClose,
}: StudentForm) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: student
      ? {
          name: student.name,
        }
      : undefined,
  });

  const onSubmit = async (data: FormData) => {
    if (student) {
      // Update
    } else {
      // Create
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {student ? 'Update Student' : 'Add Student'}
          </DialogTitle>
        </DialogHeader>
        <form className='grid gap-2' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' {...form.register('name')} />
            {form.formState.errors.name?.message && (
              <span className='text-sm text-red-400'>
                {form.formState.errors.name.message}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Close
              </Button>
            </DialogClose>
            <Button type='submit'>{student ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
