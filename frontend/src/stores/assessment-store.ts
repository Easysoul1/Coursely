import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Answer {
  questionId: string;
  answer: string;
  score: number;
}

interface AssessmentState {
  currentStep: number;
  answers: Answer[];
  isSubmitting: boolean;
  isComplete: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: (questionId: string, answer: string, score: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setComplete: (isComplete: boolean) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: [],
      isSubmitting: false,
      isComplete: false,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
      setAnswer: (questionId, answer, score) =>
        set((state) => {
          const existing = state.answers.findIndex((a) => a.questionId === questionId);
          if (existing >= 0) {
            const updated = [...state.answers];
            updated[existing] = { questionId, answer, score };
            return { answers: updated };
          }
          return { answers: [...state.answers, { questionId, answer, score }] };
        }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setComplete: (isComplete) => set({ isComplete }),
      reset: () => set({ currentStep: 0, answers: [], isSubmitting: false, isComplete: false }),
    }),
    { name: "coursely-assessment" },
  ),
);
