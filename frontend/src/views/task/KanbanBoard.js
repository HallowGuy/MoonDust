import React, { useState } from "react"
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// --- Carte déplaçable ---
const SortableItem = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "8px",
    background: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "grab",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </div>
  )
}

// --- Kanban Board ---
const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    todo: ["Créer le modèle", "Coder l’API", "Faire le frontend"],
    doing: ["Intégrer DnD-Kit"],
    done: ["Installer React"],
  })

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }) => {
    if (!over) return

    const [fromCol, fromIndex] = active.id.split(":")
    const [toCol, toIndex] = over.id.split(":")

    setColumns((prev) => {
      const fromItems = [...prev[fromCol]]
      const [movedItem] = fromItems.splice(fromIndex, 1)

      const toItems = [...prev[toCol]]
      // si on drop sur une colonne vide → ajouter à la fin
      const newIndex = toIndex !== undefined ? +toIndex : toItems.length
      toItems.splice(newIndex, 0, movedItem)

      return {
        ...prev,
        [fromCol]: fromItems,
        [toCol]: toItems,
      }
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "20px" }}>
        {Object.entries(columns).map(([col, items]) => (
          <div
            key={col}
            style={{
              flex: 1,
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 8,
              minHeight: "200px",
              background: "#f1f3f5",
            }}
          >
            <h4 style={{ textTransform: "capitalize" }}>{col}</h4>
            <SortableContext
              items={items.map((_, i) => `${col}:${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem key={`${col}:${index}`} id={`${col}:${index}`} content={item} />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}

export default KanbanBoard
