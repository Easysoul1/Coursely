import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ClipboardCheck, BarChart3, Compass, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Answer Questions",
    description: "Complete a short assessment about your academic strengths, interests, and goals.",
  },
  {
    icon: BarChart3,
    title: "Get Matched",
    description:
      "Our engine analyzes your responses and computes compatibility scores for every department.",
  },
  {
    icon: Compass,
    title: "Choose Your Path",
    description: "Explore detailed breakdowns and make an informed decision about your future.",
  },
];

const departments = [
  "Medicine & Surgery",
  "Computer Science",
  "Pharmacy",
  "Electrical Engineering",
  "Nursing",
  "Biochemistry",
  "Mechanical Engineering",
  "Physiology",
  "Statistics",
  "Anatomy",
];

export default function LandingPage() {
  return (
    <>
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm mb-6">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>University of Ibadan Career Guidance</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Academic Path at <span className="text-primary">UI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover which University of Ibadan department matches your unique strengths,
              interests, and personality. Data-driven recommendations, fully explainable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Three simple steps to finding your ideal department
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <Card key={i} className="relative">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Supported Departments</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Currently supporting science and engineering departments at the University of Ibadan
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {departments.map((dept) => (
              <div
                key={dept}
                className="rounded-lg border p-4 text-center text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Find Your Path?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join other Nigerian students who have found their ideal department at UI.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
