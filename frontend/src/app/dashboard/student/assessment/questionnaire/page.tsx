"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useAssessmentStore } from "@/stores/assessment-store";
import {
  useAssessmentQuestions,
  useAssessmentResult,
  submitAssessment,
} from "@/hooks/use-assessment";
import { generateRecommendations } from "@/hooks/use-recommendations";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const categoryLabels: Record<string, string> = {
  ACADEMIC: "Academic Performance",
  CAREER: "Career Interests",
  PERSONALITY: "Personality",
  LEARNING_STYLE: "Learning Style",
  GOAL: "Goals",
};

export default function QuestionnairePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { questions, loading: questionsLoading, error: questionsError } = useAssessmentQuestions();
  const { result: existingResult, loading: resultLoading } = useAssessmentResult(user?.id);
  const store = useAssessmentStore();
  const [submitting, setSubmitting] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (redirected) return;
    if (resultLoading) return;
    if (existingResult && !store.isComplete) {
      setRedirected(true);
      router.replace("/dashboard/student/results");
    }
  }, [existingResult, resultLoading, store.isComplete, router, redirected]);

  const currentQuestion = questions[store.currentStep];
  const progress = questions.length > 0 ? ((store.currentStep + 1) / questions.length) * 100 : 0;

  function handleScore(score: number) {
    if (!currentQuestion) return;
    store.setAnswer(currentQuestion.id, score.toString(), score);
  }

  function handleNext() {
    if (!currentQuestion) return;
    const hasAnswer = store.answers.find((a) => a.questionId === currentQuestion.id);
    if (!hasAnswer) return;
    if (store.currentStep < questions.length - 1) {
      store.nextStep();
    }
  }

  function handlePrev() {
    if (store.currentStep > 0) {
      store.prevStep();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitAssessment(store.answers);
      await generateRecommendations();
      store.setComplete(true);
      router.push("/dashboard/student/results");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already submitted")) {
        router.push("/dashboard/student/results");
      } else {
        store.reset();
        router.push("/dashboard/student/assessment");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (questionsLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load questions.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No questions available yet.</p>
      </div>
    );
  }

  const currentAnswer = store.answers.find((a) => a.questionId === currentQuestion.id);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {store.currentStep + 1} of {questions.length}
          </span>
          <span className="font-medium text-primary">
            {categoryLabels[currentQuestion.category] || currentQuestion.category}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-8 pb-8">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

          {currentQuestion.type === "SCALE" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleScore(score)}
                    className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
                      currentAnswer?.score === score
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentQuestion.type === "TRUE_FALSE" && (
            <div className="flex gap-4 justify-center">
              {[
                { label: "True", value: 8 },
                { label: "False", value: 2 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleScore(opt.value)}
                  className={`px-8 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentAnswer?.answer === opt.label
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {[
                { label: "Very Low", value: 2 },
                { label: "Low", value: 4 },
                { label: "Average", value: 6 },
                { label: "High", value: 8 },
                { label: "Very High", value: 10 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleScore(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentAnswer?.answer === opt.label
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={store.currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <span className="text-xs text-muted-foreground">
          {currentAnswer ? "Answered" : "Select an option to continue"}
        </span>

        {store.currentStep === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!currentAnswer || submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!currentAnswer}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
