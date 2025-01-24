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
  tasks: {
    id: string;
    content: string;
  }[];
};

export default function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex h-full max-h-full flex-1 flex-col rounded-lg bg-sidebar shadow-md">
      <h2 className="p-4 text-lg font-semibold">{column.title}</h2>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex-grow space-y-2 overflow-y-auto p-4"
        >
          {tasks.map((task, index) => (
            <Task key={task.id} task={task} index={index} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
