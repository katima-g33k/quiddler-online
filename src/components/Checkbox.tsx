import React from "react";

type CheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

const Checkbox = ({ checked, disabled, label, onChange }: CheckboxProps) => (
  <label className="flex gap-2">
    <input
      checked={checked}
      disabled={disabled}
      onChange={() => onChange(!checked)}
      type="checkbox"
    />
    {label}
  </label>
);

export default Checkbox;
