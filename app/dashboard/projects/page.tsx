import { ProjectsList } from "@/components/projects-list";
import { Loader } from "lucide-react";
import { Suspense } from "react";

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader size="2rem" className="animate-spin" />
        </div>
      }
    >
      <ProjectsList />
    </Suspense>
  );
}
