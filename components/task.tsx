import { Database } from "@/types/supabase";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskProps = {
  task: Database["public"]["Tables"]["tasks"]["Row"];
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
      className={`cursor-move rounded border p-4 shadow ${
        isDragging || isSortableDragging ? "" : ""
      }`}
    >
      {task.title}
    </div>
  );
}
