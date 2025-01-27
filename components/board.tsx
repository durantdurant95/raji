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
  const [initialColumn, setInitialColumn] = useState<string | null>(null);

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

  const getColumnId = (id: string): string | null => {
    if (id in boardData.columns) {
      return id;
    }
    return findColumnOfTask(id);
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
    const startingColumn = findColumnOfTask(active.id);
    setInitialColumn(startingColumn);
    console.log("DragStart - Initial Column:", startingColumn);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const overColumnId = getColumnId(overId);

    if (!initialColumn || !overColumnId || initialColumn === overColumnId) {
      return;
    }

    setBoardData((prev) => {
      // First, remove the task from all columns to prevent duplicates
      const updatedColumns = Object.entries(prev.columns).reduce(
        (acc, [columnId, column]) => {
          acc[columnId] = {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== activeId),
          };
          return acc;
        },
        { ...prev.columns },
      );

      // Then add it to the target column
      return {
        ...prev,
        columns: {
          ...updatedColumns,
          [overColumnId]: {
            ...updatedColumns[overColumnId],
            taskIds: [...updatedColumns[overColumnId].taskIds, activeId],
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

    const overColumnId = getColumnId(overId);

    console.log("DragEnd - Initial Column:", initialColumn);
    console.log("DragEnd - Over Column:", overColumnId);
    console.log("DragEnd - Over ID:", overId);

    if (!initialColumn || !overColumnId) {
      console.log("DragEnd - Missing column IDs");
      return;
    }

    if (initialColumn === overColumnId) {
      console.log("DragEnd - Same column reorder");
      const column = boardData.columns[initialColumn];
      if (!column) return;

      const oldIndex = column.taskIds.indexOf(activeId);
      const newIndex = column.taskIds.indexOf(overId);

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
      console.log("DragEnd - Different column, updating status:", {
        taskId: activeId,
        newStatus: overColumnId,
      });

      try {
        const result = await updateTaskStatus(activeId, overColumnId);
        console.log("Update task status result:", result);

        setBoardData((prev) => {
          // Remove task from all columns first
          const updatedColumns = Object.entries(prev.columns).reduce(
            (acc, [columnId, column]) => {
              acc[columnId] = {
                ...column,
                taskIds: column.taskIds.filter((id) => id !== activeId),
              };
              return acc;
            },
            { ...prev.columns },
          );

          // Add to target column
          return {
            ...prev,
            columns: {
              ...updatedColumns,
              [overColumnId]: {
                ...updatedColumns[overColumnId],
                taskIds: [...updatedColumns[overColumnId].taskIds, activeId],
              },
            },
          };
        });
      } catch (error) {
        console.error("Error updating task status:", error);
        // Revert to initial state
        setBoardData((prev) => {
          // Remove task from all columns first
          const updatedColumns = Object.entries(prev.columns).reduce(
            (acc, [columnId, column]) => {
              acc[columnId] = {
                ...column,
                taskIds: column.taskIds.filter((id) => id !== activeId),
              };
              return acc;
            },
            { ...prev.columns },
          );

          // Add back to initial column
          return {
            ...prev,
            columns: {
              ...updatedColumns,
              [initialColumn]: {
                ...updatedColumns[initialColumn],
                taskIds: [...updatedColumns[initialColumn].taskIds, activeId],
              },
            },
          };
        });
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
