import React from "react";

type CheckboxProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

const Checkbox = ({ checked, label, onChange }: CheckboxProps) => (
  <label className="flex gap-2">
    <input checked={checked} onChange={() => onChange(!checked)} type="checkbox" />
    {label}
  </label>
);

export default Checkbox;
