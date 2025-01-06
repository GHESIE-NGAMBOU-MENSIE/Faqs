export interface  Question {
    id: number; // Added ID field to represent question IDs
    question: string;
    answer: string;
    tag ? : string[];
  }