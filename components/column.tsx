import { Database } from "@/types/supabase";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Task from "./task";

type ColumnProps = {
  column: {
    id: string;
    title: string;
  };
  tasks: Database["public"]["Tables"]["tasks"]["Row"][];
};

export default function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex h-full max-h-full flex-1 flex-col rounded-lg bg-sidebar shadow-md">
      <div className="p-4">
        <h2 className="text-lg font-semibold">{column.title}</h2>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="grow space-y-2 overflow-y-auto p-4"
        >
          {tasks.map((task, index) => (
            <Task key={task.id} task={task} index={index} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
