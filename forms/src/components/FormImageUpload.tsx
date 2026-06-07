import type { FieldValues } from "react-hook-form";

import type { FormImageUploadProps } from "@/types/types";

export const FormImageUpload = <T extends FieldValues>({
  id,
  label,
  error,
  isRHF,
  register,
  name,
  onChange,
}: FormImageUploadProps<T>) => {
  const fileButtonClass = isRHF
    ? "file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
    : "file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <input
        accept="image/png, image/jpeg"
        className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${fileButtonClass}`}
        id={id}
        type="file"
        onChange={onChange}
      />
      {isRHF && register ? <input type="hidden" {...register(name)} /> : null}
      <div className="text-red-500 text-xs mt-1 h-4">{error}</div>
    </div>
  );
};
