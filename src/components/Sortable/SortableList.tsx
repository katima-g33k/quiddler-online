import React, { Dispatch, ReactNode, SetStateAction } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

type ListItem<T> = T & {
  id: string;
}

type SortableListProps<T> = {
  items: ListItem<T>[];
  renderFn: (item: T) => ReactNode;
  setItems: Dispatch<SetStateAction<ListItem<T>[]>>;
}

const SortableList = <T extends object> ({ items, renderFn, setItems }: SortableListProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setItems((items) => arrayMove(
        items,
        items.findIndex(item => item.id === active.id),
        items.findIndex(item => item.id === over?.id)),
      );
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={items}
        strategy={horizontalListSortingStrategy}
      >
        {items.map(renderFn)}
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
