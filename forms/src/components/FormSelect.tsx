import type { FieldValues } from "react-hook-form";

import type { FormSelectProps } from "@/types/types";

export const FormSelect = <T extends FieldValues>({
  id,
  label,
  error,
  isRHF,
  register,
  name,
  selectRef,
}: FormSelectProps<T>) => {
  const activeFocusClass = isRHF
    ? "focus:border-emerald-500 focus:ring-emerald-500"
    : "focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <select
        ref={isRHF ? undefined : selectRef}
        id={id}
        {...(isRHF && register ? register(name) : {})}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-1 sm:text-sm border p-2 ${activeFocusClass}`}
      >
        <option value="">Select...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <div className="text-red-500 text-xs mt-1 h-4">{error}</div>
    </div>
  );
};
