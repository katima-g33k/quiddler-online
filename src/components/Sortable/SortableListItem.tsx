import React, { PropsWithChildren } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type SortableListItemProps = {
  anchor?: React.FunctionComponent;
  className?: string;
  id: string;
}

const SortableListItem = ({ anchor, className, children, id }: PropsWithChildren<SortableListItemProps>) => {
  const Anchor = anchor;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={className}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(Anchor ? {} : listeners)}
    >
      {Anchor && <Anchor {...listeners} />}
      {children}
    </div>
  );
};

export default SortableListItem;
