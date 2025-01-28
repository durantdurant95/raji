"use client";

import { Database } from "@/types/supabase";
import { updateTaskStatus } from "@/utils/supabase/actions/tasks";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import AddTask from "./add-task-dialog";
import Column from "./column";
import Task from "./task";

type BoardData = {
  tasks: { [key: string]: Database["public"]["Tables"]["tasks"]["Row"] };
  columns: { [key: string]: { id: string; title: string; taskIds: string[] } };
  columnOrder: string[];
};

const mapTasksToBoardData = (
  tasks: Database["public"]["Tables"]["tasks"]["Row"][],
): BoardData => {
  const taskMap: {
    [key: string]: Database["public"]["Tables"]["tasks"]["Row"];
  } = {};
  const columns = {
    "To Do": { id: "To Do", title: "To Do", taskIds: [] as string[] },
    "In Progress": {
      id: "In Progress",
      title: "In Progress",
      taskIds: [] as string[],
    },
    Completed: { id: "Completed", title: "Completed", taskIds: [] as string[] },
  };

  tasks.forEach((task) => {
    taskMap[task.id] = task;
    if (task.status === "To Do") {
      columns["To Do"].taskIds.push(task.id);
    } else if (task.status === "In Progress") {
      columns["In Progress"].taskIds.push(task.id);
    } else if (task.status === "Completed") {
      columns["Completed"].taskIds.push(task.id);
    }
  });

  return {
    tasks: taskMap,
    columns,
    columnOrder: ["To Do", "In Progress", "Completed"],
  };
};

type BoardProps = {
  project: Database["public"]["Tables"]["projects"]["Row"];
  tasks: Database["public"]["Tables"]["tasks"]["Row"][];
};

export default function Board({ project, tasks }: BoardProps) {
  const [boardData, setBoardData] = useState<BoardData>(() =>
    mapTasksToBoardData(tasks),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setBoardData(mapTasksToBoardData(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnOfTask = (taskId: string): string | null => {
    for (const [columnId, column] of Object.entries(boardData.columns)) {
      if (column.taskIds.includes(taskId)) {
        return columnId;
      }
    }
    return null;
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumnId = findColumnOfTask(activeId);
    const overColumnId = findColumnOfTask(overId) || over.id;

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setBoardData((prev) => {
      const activeColumn = prev.columns[activeColumnId];
      const overColumn = prev.columns[overColumnId];

      if (!activeColumn || !overColumn) {
        return prev;
      }

      const activeTaskIds = [...activeColumn.taskIds];
      const overTaskIds = [...overColumn.taskIds];

      const activeIndex = activeTaskIds.indexOf(activeId);
      const overIndex =
        overId in prev.tasks ? overTaskIds.indexOf(overId) : overTaskIds.length;

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [activeColumnId]: {
            ...activeColumn,
            taskIds: activeTaskIds.filter((id) => id !== activeId),
          },
          [overColumnId]: {
            ...overColumn,
            taskIds: [
              ...overTaskIds.slice(0, overIndex),
              activeId,
              ...overTaskIds.slice(overIndex),
            ],
          },
        },
      };
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumnId = findColumnOfTask(activeId);
    const overColumnId = findColumnOfTask(overId) || over.id;

    if (!activeColumnId || !overColumnId) {
      return;
    }

    if (activeColumnId === overColumnId) {
      const column = boardData.columns[activeColumnId];
      if (!column) return;

      const oldIndex = column.taskIds.indexOf(activeId);
      const newIndex = column.taskIds.indexOf(overId);

      if (oldIndex === newIndex) return;

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [activeColumnId]: {
            ...column,
            taskIds: arrayMove(column.taskIds, oldIndex, newIndex),
          },
        },
      }));
    } else {
      await updateTaskStatus(activeId, overColumnId); // Update task status in the database
      handleDragOver(event);
    }

    setActiveId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="z-10 flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">{project.name}</h1>
        <AddTask projectId={project.id} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-grow overflow-x-auto overflow-y-hidden p-4">
          <div className="flex h-full w-full space-x-4">
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds.map(
                (taskId) => boardData.tasks[taskId],
              );

              return <Column key={column.id} column={column} tasks={tasks} />;
            })}
          </div>
        </div>
        <DragOverlay>
          {activeId ? (
            <Task
              task={
                boardData.tasks[activeId] || {
                  id: activeId,
                  title: "Task not found",
                }
              }
              index={0}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
