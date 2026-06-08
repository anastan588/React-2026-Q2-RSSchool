import type { FieldValues } from "react-hook-form";

import type { FormImageUploadProps } from "@/types/types";

export const FormImageUpload = <T extends FieldValues>({
  id,
  label,
  error,
  isRHF,
  onChange,
}: FormImageUploadProps<T>) => {
  const fileButtonClass = isRHF
    ? "file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
    : "file:bg-accent-soft file:text-primary hover:opacity-90";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-semibold text-foreground/80 cursor-pointer select-none"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        accept="image/png, image/jpeg"
        className={`block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:cursor-pointer transition-all ${fileButtonClass}`}
        id={id}
        type="file"
        onChange={onChange}
      />
      <div className="text-red-500 text-xs font-medium min-h-[16px] mt-0.5">
        {error}
      </div>
    </div>
  );
};
