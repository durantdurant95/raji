import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CalendarIcon, GripVertical } from "lucide-react";
import EditTask from "./edit-task-dialog";

type TaskProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string | null;
    status: string;
  };
  index: number;
  isDragging?: boolean;
};

export default function Task({ task, isDragging = false }: TaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: "bg-green-500/10 text-green-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    high: "bg-red-500/10 text-red-500",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative mb-2 bg-secondary ${
        isDragging || isSortableDragging ? "opacity-50" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium">{task.title}</span>
        </div>
        <EditTask
          task={{
            ...task,
            created_at: null,
            updated_at: null,
            project_id: "",
          }}
        />
      </CardHeader>
      {(task.description || task.due_date || task.priority) && (
        <CardContent className="space-y-2 pt-0">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(task.due_date), "MMM d, yyyy")}
              </div>
            )}
            {task.priority && (
              <Badge
                variant="secondary"
                className={
                  priorityColors[task.priority as keyof typeof priorityColors]
                }
              >
                {task.priority}
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
