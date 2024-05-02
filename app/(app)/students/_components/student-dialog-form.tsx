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
import { db } from '@/lib/firebase';
import { Student } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: student
      ? {
          name: student.name,
        }
      : undefined,
  });

  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    if (student) {
      try {
        setIsLoading(true);
        await updateDoc(doc(db, 'students', student.id), {
          name: data.name,
          nameInput: data.name.split(' ').join('').toLowerCase(),
        });
        toast({ title: 'Updated student' });
        onClose();
        router.refresh();
      } catch (_) {
        toast({ title: 'Updating student failed', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        await addDoc(collection(db, 'students'), {
          name: data.name,
          nameInput: data.name.split(' ').join('').toLowerCase(),
          createdAt: new Date().getTime(),
        });
        form.reset({ name: '' });
        toast({ title: 'Added student' });
        onClose();
        router.refresh();
      } catch (_) {
        toast({ title: 'Adding student failed', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
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
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='animate-spin w-4 h-4 mr-2' />}
              {student ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
