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
import { useToast } from '@/components/ui/use-toast';
import { db, storage } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: lesson
      ? {
          name: lesson.name,
        }
      : undefined,
  });

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    const file = data.file as FileList;
    const fileRef = ref(storage, `pdfs/${file[0].name}`);
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
              url,
              createdAt: new Date().getTime(),
            });

            form.reset({ name: '', file: null });
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
