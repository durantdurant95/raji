import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon } from "lucide-react";

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

  const opacity = isDragging || isSortableDragging ? 0.4 : 1;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity }}
      {...attributes}
      {...listeners}
      className={`cursor-move rounded bg-secondary p-4 shadow ${
        isDragging || isSortableDragging ? "ring-2 ring-primary" : ""
      }`}
    >
      <h3 className="mb-2 font-semibold">{task.title}</h3>
      {task.description && <p className="mb-2 text-sm">{task.description}</p>}
      <div className="flex items-center justify-between text-xs">
        {task.due_date && (
          <div className="flex items-center">
            <CalendarIcon className="mr-1 h-4 w-4" />
            {format(new Date(task.due_date), "MMM d, yyyy")}
          </div>
        )}
        {task.priority && (
          <div className="flex items-center">
            <AlertCircle className="mr-1 h-4 w-4" />
            {task.priority}
          </div>
        )}
      </div>
    </div>
  );
}
