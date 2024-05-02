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
import { Lesson } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type LessonForm = {
  lesson?: Lesson;
  open: boolean;
  onClose: () => void;
};

const ACCEPTED_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 5000000;

const fileSchema = z
  .any()
  .optional()
  .refine(
    (file) =>
      file.length == 1
        ? ACCEPTED_TYPES.includes(file?.[0]?.type)
          ? true
          : false
        : true,
    'Invalid file. choose PDF.',
  )
  .refine(
    (file) =>
      file.length == 1 ? (file[0]?.size <= MAX_FILE_SIZE ? true : false) : true,
    'Max file size allowed is 5MB.',
  );

const formSchema = z.object({
  name: z
    .string({ required_error: 'Field is required' })
    .min(1, 'Field is required'),
  file: fileSchema,
});

type FormData = z.infer<typeof formSchema>;

export default function LessonDialogForm({
  lesson,
  open,
  onClose,
}: LessonForm) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: lesson
      ? {
          name: lesson.name,
        }
      : undefined,
  });

  const onSubmit = async (data: FormData) => {
    if (lesson) {
      // Update
    } else {
      // Create
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{lesson ? 'Update Lesson' : 'Add Lesson'}</DialogTitle>
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
          <div className='grid gap-2'>
            <Label htmlFor='file'>Name</Label>
            <Input id='file' type='file' {...form.register('file')} />
            {form.formState.errors.file?.message && (
              <span className='text-sm text-red-400'>
                {form.formState.errors.file.message.toString()}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Close
              </Button>
            </DialogClose>
            <Button type='submit'>{lesson ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
