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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { db, storage } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  .refine(
    (file) =>
      file?.length == 1
        ? ACCEPTED_TYPES.includes(file?.[0]?.type)
          ? true
          : false
        : true,
    'Invalid file. choose PDF.',
  )
  .refine(
    (file) =>
      file?.length == 1
        ? file[0]?.size <= MAX_FILE_SIZE
          ? true
          : false
        : true,
    'Max file size allowed is 5MB.',
  )
  .refine((file) => file && file.length > 0, 'Field is required');

const formSchema = z.object({
  name: z
    .string({ required_error: 'Field is required' })
    .min(1, 'Field is required'),
  subject: z.enum(['english', 'filipino', 'math'], {
    required_error: 'Field is required',
    message: 'Field is required',
  }),
  type: z.enum(['1st', '2nd', '3rd', '4th', 'advanced'], {
    required_error: 'Field is required',
    message: 'Field is required',
  }),
  file: fileSchema,
});

type FormData = z.infer<typeof formSchema>;

export default function LessonDialogForm({
  lesson,
  open,
  onClose,
}: LessonForm) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: lesson
      ? {
          name: lesson.name,
          subject: lesson.subject,
          type: lesson.type,
        }
      : undefined,
  });

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    console.log(data);
    const file = data.file as FileList;
    const fileRef = ref(storage, `pdfs/${file[0]?.name}`);
    const uploadFile = uploadBytesResumable(fileRef, file[0]);

    setIsLoading(true);

    if (lesson) {
      try {
        uploadFile.on(
          'state_changed',
          () => {},
          (error) => {
            toast({ title: error.message, variant: 'destructive' });
          },
          async () => {
            const url = await getDownloadURL(uploadFile.snapshot.ref);

            await updateDoc(doc(db, 'lessons', lesson.id), {
              name: data.name,
              fileName: file[0].name,
              subject: data.subject,
              type: data.type,
              url,
            });

            toast({ title: 'Lesson updated' });
            onClose();
            router.refresh();
          },
        );
      } catch (_) {
        toast({ title: 'Updating lesson failed', variant: 'destructive' });
      }
    } else {
      try {
        uploadFile.on(
          'state_changed',
          () => {},
          (error) => {
            toast({ title: error.message, variant: 'destructive' });
          },
          async () => {
            const url = await getDownloadURL(uploadFile.snapshot.ref);

            await addDoc(collection(db, 'lessons'), {
              name: data.name,
              fileName: file[0].name,
              subject: data.subject,
              type: data.type,
              url,
              createdAt: new Date().getTime(),
            });

            form.reset({
              name: '',
              file: null,
              type: '1st',
              subject: 'english',
            });
            toast({ title: 'Lesson added' });
            onClose();
            router.refresh();
          },
        );
      } catch (_) {
        toast({ title: 'Adding lesson failed', variant: 'destructive' });
      }
    }
    setIsLoading(false);
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
            <Label htmlFor='name'>Subject</Label>
            <Controller
              control={form.control}
              name='subject'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a subject' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='english'>English</SelectItem>
                    <SelectItem value='filipino'>Filipino</SelectItem>
                    <SelectItem value='math'>Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.subject?.message && (
              <span className='text-sm text-red-400'>
                {form.formState.errors.subject.message}
              </span>
            )}
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Type</Label>
            <Controller
              control={form.control}
              name='type'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1st'>1st Quarter</SelectItem>
                    <SelectItem value='2nd'>2nd Quarter</SelectItem>
                    <SelectItem value='3rd'>3rd Quarter</SelectItem>
                    <SelectItem value='4th'>4th Quarter</SelectItem>
                    <SelectItem value='advanced'>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.subject?.message && (
              <span className='text-sm text-red-400'>
                {form.formState.errors.subject.message}
              </span>
            )}
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='file'>File</Label>
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
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {lesson ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
