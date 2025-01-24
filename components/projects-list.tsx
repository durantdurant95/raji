import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProjects } from "@/utils/supabase/actions/projects";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";

export async function ProjectsList() {
  const projects = await fetchProjects();

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
        {projects?.projects?.map((project) => (
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
