import { TextareaField } from "@/components/pitch/TextareaField";

interface VisionSectionProps {
  problem: string;
  solution: string;
  problemError?: string;
  solutionError?: string;
  onProblemChange: (value: string) => void;
  onSolutionChange: (value: string) => void;
  onProblemBlur: () => void;
  onSolutionBlur: () => void;
}

export function VisionSection({
  problem,
  solution,
  problemError,
  solutionError,
  onProblemChange,
  onSolutionChange,
  onProblemBlur,
  onSolutionBlur,
}: VisionSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">The Vision</h3>
      </div>
      <TextareaField
        id="problem"
        label="The Problem"
        placeholder="What specific pain point does your target market face? Use clear, data-driven examples."
        value={problem}
        maxLength={500}
        error={problemError}
        onBlur={onProblemBlur}
        onChange={onProblemChange}
      />
      <TextareaField
        id="solution"
        label="Your Solution"
        placeholder="How does your product uniquely solve this problem? Focus on your competitive advantage."
        value={solution}
        maxLength={500}
        error={solutionError}
        onBlur={onSolutionBlur}
        onChange={onSolutionChange}
      />
    </section>
  );
}
