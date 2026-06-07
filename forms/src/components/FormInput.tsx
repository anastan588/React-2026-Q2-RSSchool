import { useState } from "react";
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
    ? "focus:border-emerald-500 focus:ring-emerald-500"
    : "focus:border-indigo-500 focus:ring-indigo-500";

  const isPasswordField = type === "password";
  const currentInputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          ref={isRHF ? undefined : inputRef}
          id={id}
          type={currentInputType}
          {...(isRHF && register ? register(name, { valueAsNumber }) : {})}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-1 sm:text-sm border p-2 pr-10 ${activeFocusClass}`}
          onChange={onChange}
        />

        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? (
              // Скрытый глаз (Eye Slash Icon)
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      <div className="text-red-500 text-xs mt-1 h-4">{error}</div>
    </div>
  );
};
