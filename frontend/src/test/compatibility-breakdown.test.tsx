import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompatibilityBreakdown } from "@/components/features/compatibility-breakdown";

describe("CompatibilityBreakdown", () => {
  it("renders nothing when breakdown is empty", () => {
    const { container } = render(<CompatibilityBreakdown breakdown={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders factor labels and scores", () => {
    render(
      <CompatibilityBreakdown breakdown={{ mathematics_strength: 8, logical_reasoning: 6 }} />,
    );

    expect(screen.getByText("Why this match?")).toBeInTheDocument();
    expect(screen.getByText("mathematics strength")).toBeInTheDocument();
    expect(screen.getByText("logical reasoning")).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();
    expect(screen.getByText("6/10")).toBeInTheDocument();
  });

  it("renders progress bars for each factor", () => {
    const { container } = render(<CompatibilityBreakdown breakdown={{ test_factor: 7 }} />);

    const progressBars = container.querySelectorAll('[data-slot="progress"]');
    expect(progressBars.length).toBe(1);
  });
});
