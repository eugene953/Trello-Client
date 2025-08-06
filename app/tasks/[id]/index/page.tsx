"use client";

import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEdit } from "react-icons/fi";

type Card = {
  id: string;
  title: string;
};

type Column = {
  id: string;
  title: string;
  cards: Card[];
};

const initialColumns: Column[] = [
  { id: "col-1", title: "To Do", cards: [] },
  { id: "col-2", title: "Doing", cards: [] },
  { id: "col-3", title: "Done", cards: [] },
];

export default function IndexPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newCards, setNewCards] = useState<{ [columnId: string]: string }>({});
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedCardTitle, setEditedCardTitle] = useState("");

  useEffect(() => {
    const createdTitle = localStorage.getItem("createdTaskTitle");
    const createdId = localStorage.getItem("createdTaskId");
    if (createdTitle && createdId) {
      const newCard: Card = { id: createdId, title: createdTitle };
      setColumns((prev) =>
        prev.map((col) =>
          col.id === "col-1" ? { ...col, cards: [newCard, ...col.cards] } : col
        )
      );
      localStorage.removeItem("createdTaskTitle");
      localStorage.removeItem("createdTaskId");
    }
  }, []);

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    setColumns((prev) => [
      ...prev,
      { id: `col-${Date.now()}`, title: newColumnTitle, cards: [] },
    ]);
    setNewColumnTitle("");
  };

  const addCardToColumn = (columnId: string) => {
    const title = newCards[columnId];
    if (!title?.trim()) return;
    const newCard: Card = { id: `card-${Date.now()}`, title };
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
    setNewCards((prev) => ({ ...prev, [columnId]: "" }));
  };

  const startEditingTitle = (columnId: string, currentTitle: string) => {
    setEditingColumnId(columnId);
    setEditedTitle(currentTitle);
  };

  const saveEditedTitle = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, title: editedTitle } : col
      )
    );
    setEditingColumnId(null);
    setEditedTitle("");
  };

  const startEditingCard = (cardId: string, currentTitle: string) => {
    setEditingCardId(cardId);
    setEditedCardTitle(currentTitle);
  };

  const saveEditedCard = (cardId: string, columnId: string) => {
    setColumns((prevCols) =>
      prevCols.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId ? { ...card, title: editedCardTitle } : card
              ),
            }
          : col
      )
    );
    setEditingCardId(null);
    setEditedCardTitle("");
  };

  const deleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    let sourceColIndex = -1;
    let sourceCardIndex = -1;
    let card: Card | null = null;

    columns.forEach((col, colIndex) => {
      const index = col.cards.findIndex((t) => t.id === active.id);
      if (index > -1) {
        sourceColIndex = colIndex;
        sourceCardIndex = index;
        card = col.cards[index];
      }
    });

    if (!card) return;

    const destinationColIndex = columns.findIndex((col) =>
      col.cards.find((t) => t.id === over.id)
    );

    if (destinationColIndex === -1) return;

    const updatedCols = [...columns];
    updatedCols[sourceColIndex].cards.splice(sourceCardIndex, 1);
    updatedCols[destinationColIndex].cards.push(card);

    setColumns(updatedCols);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Card Board</h1>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded shadow-md p-4 w-72 flex-shrink-0"
            >
              <div className="flex justify-between items-center mb-3">
                {editingColumnId === col.id ? (
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => saveEditedTitle(col.id)}
                    autoFocus
                    className="border-b border-gray-400 outline-none text-lg font-semibold w-full"
                  />
                ) : (
                  <h2
                    className="font-semibold text-lg cursor-pointer"
                    onClick={() => startEditingTitle(col.id, col.title)}
                  >
                    {col.title}
                  </h2>
                )}
                <button
                  onClick={() => deleteColumn(col.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  &times;
                </button>
              </div>

              <SortableContext
                items={col.cards.map((t) => t.id)}
                strategy={rectSortingStrategy}
              >
                <div className="space-y-2">
                  {col.cards.map((card) => (
                    <DraggableCard
                      key={card.id}
                      card={card}
                      columnId={col.id}
                      isEditing={editingCardId === card.id}
                      editedCardTitle={editedCardTitle}
                      setEditedCardTitle={setEditedCardTitle}
                      startEditingCard={startEditingCard}
                      saveEditedCard={saveEditedCard}
                    />
                  ))}
                </div>
              </SortableContext>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Add a Card..."
                  value={newCards[col.id] || ""}
                  onChange={(e) =>
                    setNewCards((prev) => ({
                      ...prev,
                      [col.id]: e.target.value,
                    }))
                  }
                  className="w-full mt-2 px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={() => addCardToColumn(col.id)}
                  className="mt-2 w-full bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}

          {/* Add new column */}
          <div className="bg-white rounded shadow-md p-4 w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="New list title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="mb-2 w-full px-3 py-2 rounded border border-gray-300 focus:outline-none"
            />
            <button
              onClick={addColumn}
              className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition"
            >
              + Add List
            </button>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

function DraggableCard({
  card,
  columnId,
  isEditing,
  editedCardTitle,
  setEditedCardTitle,
  startEditingCard,
  saveEditedCard,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="bg-gray-50 border border-gray-300 rounded p-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              value={editedCardTitle}
              onChange={(e) => setEditedCardTitle(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
            <button
              onClick={() => saveEditedCard(card.id, columnId)}
              className="text-green-600 font-bold"
            >
              Save
            </button>
          </div>
        ) : (
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => startEditingCard(card.id, card.title)}
          >
            <p className="font-medium">{card.title}</p>
            <span className="text-blue-500 text-sm ml-2">
              <FiEdit size={16} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
