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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { db, storage } from '@/lib/firebase';
import { Activity } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FileImage, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

type ActivityForm = {
  activity?: Activity;
  open: boolean;
  onClose: () => void;
};

const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 15000000;

const fileSchema = z
  .any()
  .optional()
  .refine(
    (file) =>
      file && file.length == 1
        ? ACCEPTED_TYPES.includes(file?.[0]?.type)
          ? true
          : false
        : true,
    'Invalid file. choose JPG or PNG.',
  )
  .refine(
    (file) =>
      file && file.length == 1
        ? file[0]?.size <= MAX_FILE_SIZE
          ? true
          : false
        : true,
    'Max file size allowed is 15MB.',
  );

const questionSchema = z.object({
  image: fileSchema.optional(),
  question: z
    .string({ required_error: 'Question is required' })
    .min(1, 'Question is required'),
  options: z.array(
    z
      .string({ required_error: 'Option is required' })
      .min(4, 'Option is required'),
  ),
  answer: z
    .string({ required_error: 'Answer is required' })
    .min(1, 'Answer is required'),
});

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
  questions: questionSchema.array().min(1),
});

type FormData = z.infer<typeof formSchema>;
type Question = z.infer<typeof questionSchema>;

export default function ActivityDialogForm({
  activity,
  open,
  onClose,
}: ActivityForm) {
  const [isLoading, setIsLoading] = useState(false);
  const defaultFieldValues: Question = {
    answer: '0',
    options: ['', '', '', ''],
    question: '',
    image: null,
  };
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', questions: [defaultFieldValues] },
    values: activity
      ? {
          name: activity.name,
          subject: activity.subject,
          type: activity.type,
          questions: activity.questions.map((q) => ({
            ...q,
            image: q.imageName,
            answer: q.answer.toString(),
          })),
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    const questions = await Promise.all(
      data.questions.map(async (item) => {
        const existingQuestionWithSameImageName = activity?.questions.find(
          (q) => q.imageName === item.image,
        );

        if (existingQuestionWithSameImageName) {
          return {
            question: item.question,
            options: item.options,
            answer: Number(item.answer),
            imageName: existingQuestionWithSameImageName.imageName,
            imageUrl: existingQuestionWithSameImageName.imageUrl,
          };
        } else if (item.image && item.image.length > 0) {
          const file = item.image[0] as File;
          const fileRef = ref(storage, `images/${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);
          const snapshot = await uploadTask;
          const url = await getDownloadURL(snapshot.ref);

          return {
            question: item.question,
            options: item.options,
            answer: Number(item.answer),
            imageName: file.name,
            imageUrl: url,
          };
        } else {
          return {
            question: item.question,
            answer: Number(item.answer),
            options: item.options,
            imageName: null,
            imageUrl: null,
          };
        }
      }),
    );
    if (activity) {
      try {
        await updateDoc(doc(db, 'activities', activity.id), {
          name: data.name,
          subject: data.subject,
          type: data.type,
          questions,
        });

        toast({ title: 'Updated activity' });
        onClose();
        router.refresh();
      } catch (error) {
        toast({ title: 'Updating activity failed', variant: 'destructive' });
        console.log(error);
      }
    } else {
      try {
        await addDoc(collection(db, 'activities'), {
          name: data.name,
          subject: data.subject,
          type: data.type,
          questions,
          createdAt: new Date().getTime(),
        });

        toast({ title: 'Added activity' });
        onClose();
        form.reset({
          name: '',
          subject: 'english',
          type: '1st',
          questions: [defaultFieldValues],
        });
        router.refresh();
      } catch (error) {
        toast({ title: 'Adding activity failed', variant: 'destructive' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Update Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>
        <form
          className='grid gap-2 max-h-96 p-2 overflow-auto'
          onSubmit={form.handleSubmit(onSubmit)}>
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
          <div className='px-2 grid gap-4'>
            {fields.map((_, index) => (
              <div key={index}>
                <div className='flex items-center justify-between'>
                  <p className='font-semibold pb-2'>{index + 1}. Question</p>
                  {fields.length > 1 && (
                    <Button
                      onClick={() => remove(index)}
                      size='icon'
                      variant='ghost'>
                      <X className='w-4 h-4' />
                    </Button>
                  )}
                </div>
                <div className='grid gap-2'>
                  <div className='grid gap-2'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor={`image-${index}`}>Image</Label>
                      {activity &&
                        activity.questions?.[index]?.imageName &&
                        activity.questions?.[index]?.imageUrl && (
                          <Button
                            type='button'
                            className='p-0 h-0'
                            asChild
                            variant='link'>
                            <Link
                              target='_blank'
                              href={activity.questions[index].imageUrl!}>
                              <FileImage className='w-4 h-4 mr-2' />
                              <span>{activity.questions[index].imageName}</span>
                            </Link>
                          </Button>
                        )}
                    </div>
                    <Input
                      id={`image-${index}`}
                      type='file'
                      {...form.register(`questions.${index}.image`)}
                    />
                    {form.formState.errors.questions?.[index]?.image
                      ?.message && (
                      <span className='text-sm text-red-400'>
                        {form.formState.errors.questions?.[
                          index
                        ]?.image?.message?.toString()}
                      </span>
                    )}
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor={`question-${index}`}>Question</Label>
                    <Input
                      id={`question-${index}`}
                      {...form.register(`questions.${index}.question`)}
                    />
                    {form.formState.errors.questions?.[index]?.question
                      ?.message && (
                      <span className='text-sm text-red-400'>
                        {
                          form.formState.errors.questions[index]?.question
                            ?.message
                        }
                      </span>
                    )}
                  </div>

                  <Controller
                    control={form.control}
                    name={`questions.${index}.answer`}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className='grid gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <RadioGroupItem value='0' />
                          <Input
                            id={`options-${index}-0`}
                            placeholder='Option 1'
                            {...form.register(`questions.${index}.options.0`)}
                          />
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <RadioGroupItem value='1' />
                          <Input
                            id={`options-${index}-1`}
                            placeholder='Option 2'
                            {...form.register(`questions.${index}.options.1`)}
                          />
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <RadioGroupItem value='2' />
                          <Input
                            id={`options-${index}-2`}
                            placeholder='Option 3'
                            {...form.register(`questions.${index}.options.2`)}
                          />
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <RadioGroupItem value='3' />
                          <Input
                            id={`options-${index}-3`}
                            placeholder='Option 4'
                            {...form.register(`questions.${index}.options.3`)}
                          />
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {form.formState.errors.questions?.[index]?.options && (
                    <span className='text-sm text-red-400'>
                      Options is required
                    </span>
                  )}
                  {form.formState.errors.questions?.[index]?.answer
                    ?.message && (
                    <span className='text-sm text-red-400'>
                      {form.formState.errors.questions[index]?.answer?.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => append(defaultFieldValues)}>
              Add Question
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Close
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='animate-spin w-4 h-4 mr-2' />}
              {activity ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
