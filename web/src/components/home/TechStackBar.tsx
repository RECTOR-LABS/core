import type { TechStack } from "@/lib/github/tech-stack";

interface Props {
  techStack: TechStack;
}

export function TechStackBar({ techStack }: Props) {
  if (techStack.primary.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-[#3B2C22]/5 border-l-4 border-[#41CFFF] rounded">
      <p className="text-sm font-medium text-[#3B2C22]/60 mb-1">
        BUILDING ACROSS {techStack.totalRepos} REPOSITORIES
      </p>
      <p className="font-mono text-base font-semibold text-[#3B2C22] mb-0">
        {techStack.primary.map((l) => l.name).join(" • ")}
      </p>
    </div>
  );
}
