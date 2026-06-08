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
    ? "focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1"
    : "focus:border-primary focus:ring-primary focus:ring-1";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-semibold text-foreground/80 cursor-pointer select-none"
        htmlFor={id}
      >
        {label}
      </label>
      <select
        ref={isRHF ? undefined : selectRef}
        id={id}
        {...(isRHF && register ? register(name) : {})}
        className={`block w-full rounded-md bg-card border border-border-custom px-3 py-2 text-sm text-foreground shadow-xs outline-hidden transition-all cursor-pointer ${activeFocusClass}`}
      >
        <option value="" className="bg-card text-foreground">
          Select...
        </option>
        <option value="male" className="bg-card text-foreground">
          Male
        </option>
        <option value="female" className="bg-card text-foreground">
          Female
        </option>
        <option value="other" className="bg-card text-foreground">
          Other
        </option>
      </select>
      <div className="text-red-500 text-xs font-medium min-h-[16px] mt-0.5">
        {error}
      </div>
    </div>
  );
};
