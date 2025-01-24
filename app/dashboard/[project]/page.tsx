import Board from "@/components/board";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const project = (await params).project;
  return (
    <main className="flex h-[calc(100vh-64px)] flex-col">
      <Board />
    </main>
  );
}
