export type Student = {
  id: string;
  name: string;
  nameInput: string;
  createdAt: number;
};

export type Lesson = {
  id: string;
  name: string;
  subject: 'english' | 'filipino' | 'math';
  type: 'quarter 1' | 'quarter 2' | 'quarter 3' | 'quarter 4' | 'advanced';
  fileName: string;
  url: string;
  createdAt: number;
};

export type Activity = {
  id: string;
  name: string;
  createdAt: number;
  questions: {
    imageUrl: string | null;
    imageName: string | null;
    question: string;
    options: string[];
    answer: number;
  }[];
};
