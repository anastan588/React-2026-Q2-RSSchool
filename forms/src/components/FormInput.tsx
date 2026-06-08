import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { type FieldValues } from "react-hook-form";

import type { FormInputProps } from "@/types/types";

export const FormInput = <T extends FieldValues>({
  id,
  label,
  type = "text",
  error,
  isRHF,
  register,
  name,
  valueAsNumber,
  inputRef,
  onChange,
}: FormInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const activeFocusClass = isRHF
    ? "focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1"
    : "focus:border-primary focus:ring-primary focus:ring-1";

  const isPasswordField = type === "password";
  const currentInputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-semibold text-foreground/80 cursor-pointer select-none"
        htmlFor={id}
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={isRHF ? undefined : inputRef}
          id={id}
          type={currentInputType}
          {...(isRHF && register ? register(name, { valueAsNumber }) : {})}
          className={`block w-full rounded-md bg-card/50 border border-border-custom px-3 py-2 text-sm text-foreground shadow-xs outline-hidden transition-all placeholder:text-muted ${activeFocusClass} ${
            isPasswordField ? "pr-10" : ""
          }`}
          onChange={onChange}
        />

        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground focus:outline-hidden transition-colors cursor-pointer"
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      <div className="text-red-500 text-xs font-medium min-h-[16px] mt-0.5">
        {error}
      </div>
    </div>
  );
};
