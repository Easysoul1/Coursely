import { describe, it, expect, beforeEach } from "vitest";
import { useAssessmentStore } from "@/stores/assessment-store";

describe("assessment-store", () => {
  beforeEach(() => {
    useAssessmentStore.getState().reset();
  });

  it("starts at step 0 with no answers", () => {
    const state = useAssessmentStore.getState();
    expect(state.currentStep).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.isSubmitting).toBe(false);
    expect(state.isComplete).toBe(false);
  });

  it("nextStep advances the step", () => {
    useAssessmentStore.getState().nextStep();
    expect(useAssessmentStore.getState().currentStep).toBe(1);
  });

  it("prevStep goes back", () => {
    useAssessmentStore.getState().setStep(2);
    useAssessmentStore.getState().prevStep();
    expect(useAssessmentStore.getState().currentStep).toBe(1);
  });

  it("setAnswer stores a new answer", () => {
    useAssessmentStore.getState().setAnswer("q1", "5", 7);
    expect(useAssessmentStore.getState().answers).toEqual([
      { questionId: "q1", answer: "5", score: 7 },
    ]);
  });

  it("setAnswer updates existing answer", () => {
    useAssessmentStore.getState().setAnswer("q1", "5", 7);
    useAssessmentStore.getState().setAnswer("q1", "8", 9);
    expect(useAssessmentStore.getState().answers).toEqual([
      { questionId: "q1", answer: "8", score: 9 },
    ]);
  });

  it("reset clears state", () => {
    useAssessmentStore.getState().setAnswer("q1", "5", 7);
    useAssessmentStore.getState().setStep(3);
    useAssessmentStore.getState().setSubmitting(true);
    useAssessmentStore.getState().reset();

    const state = useAssessmentStore.getState();
    expect(state.currentStep).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.isSubmitting).toBe(false);
  });
});
