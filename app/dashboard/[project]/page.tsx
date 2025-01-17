export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const project = (await params).project;
  return <div>My project name: {project}</div>;
}
