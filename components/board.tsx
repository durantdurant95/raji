"use client";

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
import { useState } from "react";
import AddTask from "./add-task-dialog";
import Column from "./column";
import Task from "./task";

type TaskType = {
  id: string;
  content: string;
};

type ColumnType = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: { [key: string]: TaskType };
  columns: { [key: string]: ColumnType };
  columnOrder: string[];
};

const initialData: BoardData = {
  tasks: {
    "task-1": { id: "task-1", content: "Take out the garbage" },
    "task-2": { id: "task-2", content: "Watch my favorite show" },
    "task-3": { id: "task-3", content: "Charge my phone" },
    "task-4": { id: "task-4", content: "Cook dinner" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To do",
      taskIds: ["task-1", "task-2", "task-3", "task-4"],
    },
    "column-2": {
      id: "column-2",
      title: "In progress",
      taskIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: [],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

export default function Board() {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    const newTask = { id: newTaskId, content };
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
        <h1 className="text-xl font-bold">Here goes my Project name</h1>
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
                  content: "Task not found",
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
