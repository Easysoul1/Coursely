import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ — Coursely",
  description:
    "Frequently asked questions about Coursely — how recommendations work, what subjects are supported, and how to get started.",
};

const faqs = [
  {
    category: "General",
    items: [
      {
        q: "What is Coursely?",
        a: "Coursely is an academic career guidance platform designed specifically for Nigerian science students seeking admission to the University of Ibadan. It recommends departments based on your O'level results, JAMB subjects, career interests, personality traits, and department competitiveness.",
      },
      {
        q: "Is Coursely free to use?",
        a: "Yes, Coursely is completely free for students. Our goal is to help every Nigerian student make informed academic decisions.",
      },
    ],
  },
  {
    category: "Assessment",
    items: [
      {
        q: "How long does the assessment take?",
        a: "The assessment typically takes about 10 minutes to complete. It covers five sections: Academic Performance, Career Interests, Personality, Learning Style, and Goals.",
      },
      {
        q: "Can I retake the assessment?",
        a: "Yes, you can retake the assessment if your preferences or circumstances change. Your results will be updated accordingly.",
      },
      {
        q: "What types of questions are asked?",
        a: "The assessment includes scale-based questions (rate 1-10), multiple choice, and true/false questions across various categories.",
      },
    ],
  },
  {
    category: "Recommendations",
    items: [
      {
        q: "How are recommendations calculated?",
        a: "Our engine uses an explainable rule-based scoring system. It analyzes your responses across six factors (Mathematics, Biology, Logical Reasoning, Communication, Interest Alignment, Study Tolerance) and compares them against each department's unique scoring profile.",
      },
      {
        q: "Can I see why a department was recommended?",
        a: "Absolutely! Every recommendation includes a per-factor breakdown showing your scores for each factor and how they contributed to the overall compatibility percentage.",
      },
      {
        q: "What if my top choice is very competitive?",
        a: "The system automatically suggests alternative departments if your top choice has high cutoff marks. These alternatives still align with your strengths but may have lower entry requirements.",
      },
    ],
  },
  {
    category: "Technical",
    items: [
      {
        q: "Which departments are currently supported?",
        a: "We currently support science and engineering departments at the University of Ibadan, including Medicine, Computer Science, Pharmacy, Nursing, Engineering, and more.",
      },
      {
        q: "Is my data secure?",
        a: "Yes, your data is encrypted and stored securely. We never share your personal information with third parties.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Everything you need to know about Coursely and how it works.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((group) => (
            <div key={group.category}>
              <h2 className="text-xl font-semibold mb-4">{group.category}</h2>
              <div className="space-y-3">
                {group.items.map((item, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.q}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
