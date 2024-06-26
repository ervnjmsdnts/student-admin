'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z
    .string({ required_error: 'Field is required' })
    .min(1, 'Field is required')
    .email('Not a valid email address'),
  password: z
    .string({ required_error: 'Field is required' })
    .min(1, 'Field is required'),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const credentials = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const idToken = await credentials.user.getIdToken();

      await fetch('/api/login', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      router.refresh();
    } catch (_) {
      toast({ title: 'Invalid Credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-full grid grid-cols-3'>
      <div className='col-span-2 bg-primary text-primary-foreground'>
        <div className='flex justify-center items-center h-full'>
          <p className='text-center text-2xl font-bold max-w-80'>
            STUDENT MASTERY AND ACADEMIC RESOURCE TERMINAL
          </p>
        </div>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex items-center justify-center gap-8 flex-col'>
        <div className='grid w-full max-w-sm items-center gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            type='email'
            id='email'
            placeholder='Email'
            {...form.register('email')}
          />
          {form.formState.errors.email?.message && (
            <span className='text-sm text-red-400'>
              {form.formState.errors.email.message}
            </span>
          )}
        </div>
        <div className='grid w-full max-w-sm items-center gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            type='password'
            id='password'
            placeholder='Password'
            {...form.register('password')}
          />
          {form.formState.errors.password?.message && (
            <span className='text-sm text-red-400'>
              {form.formState.errors.password.message}
            </span>
          )}
        </div>
        <Button className='w-full max-w-sm'>
          {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />} Login
        </Button>
      </form>
    </div>
  );
}
