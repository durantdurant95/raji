import { deleteProject, fetchProjects } from "@/app/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";

export async function ProjectsList() {
  const projects = await fetchProjects();

  async function handleDelete(id: string) {
    const response = await deleteProject(id);

    if (response.error) {
      toast.error("Error", {
        description: response.error,
      });
    } else {
      toast.success("Success", {
        description: "Project deleted successfully!",
      });
    }
  }

  if ("error" in projects) {
    return <div>Error: {projects.error?.toString()}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>{project.description}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <EditProjectDialog project={project} />
                <DeleteProjectDialog project={project} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
