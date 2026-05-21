import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Eye, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Coursely",
  description:
    "Coursely helps Nigerian science students find their ideal department at the University of Ibadan through data-driven, explainable recommendations.",
};

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Coursely</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering Nigerian science students to make informed academic decisions through
            transparent, data-driven career guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Eye,
              title: "Our Mission",
              description:
                "To help every Nigerian science student discover the University of Ibadan department that best aligns with their academic strengths, career interests, and personality.",
            },
            {
              icon: Lightbulb,
              title: "Our Vision",
              description:
                "A future where every student chooses their academic path with confidence, reducing mismatched admissions and increasing graduation success rates.",
            },
            {
              icon: HeartHandshake,
              title: "Our Values",
              description:
                "Transparency, accessibility, and data-driven decisions. No black-box algorithms — every recommendation comes with a clear, explainable breakdown.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/50 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">How Recommendations Work</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Our recommendation engine uses an{" "}
              <strong>explainable rule-based scoring system</strong>. Unlike black-box AI models,
              every recommendation comes with a per-factor breakdown so you can see exactly why a
              department was suggested.
            </p>
            <p>
              We analyze your responses across six key factors:{" "}
              <strong>Mathematics Strength</strong>, <strong>Biology Strength</strong>,{" "}
              <strong>Logical Reasoning</strong>, <strong>Communication Skill</strong>,{" "}
              <strong>Interest Alignment</strong>, and <strong>Study Tolerance</strong>.
            </p>
            <p>
              Each department has its own scoring profile. For example, Medicine weights Biology
              highly while Computer Science weights Mathematics and Logical Reasoning. Your scores
              are compared against each department&apos;s profile to compute a compatibility
              percentage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
