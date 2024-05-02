'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className='w-full h-full grid grid-cols-3'>
      <div className='col-span-2 bg-primary text-primary-foreground'>
        <div className='flex justify-center items-center h-full'>Title</div>
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
        <Button className='w-full max-w-sm'>Login</Button>
      </form>
    </div>
  );
}
