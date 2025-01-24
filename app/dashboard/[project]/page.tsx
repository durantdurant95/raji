import Board from "@/components/board";
import { fetchProjectById } from "@/utils/supabase/actions/projects";
import { fetchTasksByProject } from "@/utils/supabase/actions/tasks";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const projectId = (await params).project;
  const projectData = await fetchProjectById(projectId);

  if (!projectData || "error" in projectData) {
    return <div>Project not found</div>;
  }

  const tasks = await fetchTasksByProject(projectId);

  return (
    <main className="flex h-[calc(100vh-64px)] flex-col">
      <Board project={projectData} tasks={tasks} />
    </main>
  );
}
