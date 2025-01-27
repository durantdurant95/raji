"use client";

import { Database } from "@/types/supabase";
import { updateTaskStatus } from "@/utils/supabase/actions/tasks";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
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
  const [initialColumn, setInitialColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setBoardData(mapTasksToBoardData(tasks));
  }, [tasks]);

  const findColumnOfTask = (taskId: string): string | null => {
    for (const [columnId, column] of Object.entries(boardData.columns)) {
      if (column.taskIds.includes(taskId)) {
        return columnId;
      }
    }
    return null;
  };

  const getColumnId = (id: string): string | null => {
    return id in boardData.columns ? id : findColumnOfTask(id);
  };

  const updateColumns = (taskId: string, targetColumnId: string) => {
    return (prev: BoardData) => {
      const updatedColumns = Object.entries(prev.columns).reduce(
        (acc, [columnId, column]) => ({
          ...acc,
          [columnId]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        }),
        { ...prev.columns },
      );

      return {
        ...prev,
        columns: {
          ...updatedColumns,
          [targetColumnId]: {
            ...updatedColumns[targetColumnId],
            taskIds: [...updatedColumns[targetColumnId].taskIds, taskId],
          },
        },
      };
    };
  };
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id.toString());
    setInitialColumn(findColumnOfTask(active.id.toString()));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const overColumnId = getColumnId(over.id.toString());
    if (!initialColumn || !overColumnId || initialColumn === overColumnId)
      return;

    setBoardData(updateColumns(active.id.toString(), overColumnId));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || !initialColumn) return;

    const overColumnId = getColumnId(over.id.toString());
    if (!overColumnId) return;

    if (initialColumn === overColumnId) {
      const column = boardData.columns[initialColumn];
      if (!column) return;

      const oldIndex = column.taskIds.indexOf(active.id.toString());
      const newIndex = column.taskIds.indexOf(over.id.toString());
      if (oldIndex === newIndex) return;

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [initialColumn]: {
            ...column,
            taskIds: arrayMove(column.taskIds, oldIndex, newIndex),
          },
        },
      }));
    } else {
      try {
        await updateTaskStatus(active.id.toString(), overColumnId);
        setBoardData(updateColumns(active.id.toString(), overColumnId));
      } catch (error) {
        console.error("Error updating task status:", error);
        setBoardData(updateColumns(active.id.toString(), initialColumn));
      }
    }

    setActiveId(null);
    setInitialColumn(null);
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
          {activeId && (
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
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
