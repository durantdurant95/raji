"use client";

import { Database } from "@/types/supabase";
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
    "column-1": { id: "column-1", title: "To do", taskIds: [] as string[] },
    "column-2": {
      id: "column-2",
      title: "In progress",
      taskIds: [] as string[],
    },
    "column-3": { id: "column-3", title: "Done", taskIds: [] as string[] },
  };

  tasks.forEach((task) => {
    taskMap[task.id] = task;
    columns["column-1"].taskIds.push(task.id); // Assuming all tasks start in "To do" column
  });

  return {
    tasks: taskMap,
    columns,
    columnOrder: ["column-1", "column-2", "column-3"],
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

  const handleDragEnd = (event: any) => {
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
      handleDragOver(event);
    }

    setActiveId(null);
  };

  const addTask = (content: string) => {
    const newTaskId = `task-${Object.keys(boardData.tasks).length + 1}`;
    const newTask = {
      id: newTaskId,
      title: content,
      status: "To do",
      project_id: project.id,
      created_at: null,
      description: null,
      due_date: null,
      priority: null,
      updated_at: null,
    };
    const newBoardData = {
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...boardData.columns,
        "column-1": {
          ...boardData.columns["column-1"],
          taskIds: [...boardData.columns["column-1"].taskIds, newTaskId],
        },
      },
    };
    setBoardData(newBoardData);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="z-10 flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">{project.name}</h1>
        <AddTask onAddTask={addTask} />
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
