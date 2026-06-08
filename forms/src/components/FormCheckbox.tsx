import type { FieldValues } from "react-hook-form";

import type { FormCheckboxProps } from "@/types/types";

export const FormCheckbox = <T extends FieldValues>({
  id,
  label,
  error,
  isRHF,
  register,
  name,
  checkboxRef,
}: FormCheckboxProps<T>) => {
  const activeFocusClass = isRHF
    ? "text-emerald-600 focus:ring-emerald-500"
    : "text-indigo-600 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={id}
            type="checkbox"
            ref={isRHF ? undefined : checkboxRef}
            {...(isRHF && register ? register(name) : {})}
            className={`h-4 w-4 rounded border-gray-300 ${activeFocusClass}`}
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700" htmlFor={id}>
            {label}
          </label>
        </div>
      </div>
      {/* Если error равен null или undefined, выведется пустая строка, сохраняя h-4 */}
      <div className="text-red-500 text-xs mt-1 h-4">{error || ""}</div>
    </div>
  );
};
