export type Student = {
  id: string;
  name: string;
  nameInput: string;
  createdAt: number;
};

export type Lesson = {
  id: string;
  name: string;
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
