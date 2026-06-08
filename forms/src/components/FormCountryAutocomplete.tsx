import type { FieldValues } from "react-hook-form";

import { COUNTRIES, type FormCountryAutocompleteProps } from "@/types/types";

export const FormCountryAutocomplete = <T extends FieldValues>({
  id,
  label,
  error,
  isRHF,
  register,
  name,
  value,
  onSelect,
  onChangeUncontrolled,
}: FormCountryAutocompleteProps<T>) => {
  const activeFocusClass = isRHF
    ? "focus:border-emerald-500 focus:ring-emerald-500"
    : "focus:border-indigo-500 focus:ring-indigo-500";

  const hoverOptionClass = isRHF ? "hover:bg-emerald-50" : "hover:bg-indigo-50";

  const filteredCountries = value
    ? (COUNTRIES as readonly string[]).filter((c) =>
        c.toLowerCase().includes(value.toLowerCase()),
      )
    : [];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={isRHF ? undefined : value}
        onChange={isRHF ? undefined : onChangeUncontrolled}
        {...(isRHF && register ? register(name) : {})}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-1 sm:text-sm border p-2 ${activeFocusClass}`}
      />
      {value &&
      !(COUNTRIES as readonly string[]).includes(value) &&
      filteredCountries.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white border shadow-lg text-sm">
          {filteredCountries.map((c) => (
            <li
              key={c}
              className={`cursor-pointer p-2 ${hoverOptionClass}`}
              onClick={() => onSelect(c)}
            >
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="text-red-500 text-xs mt-1 h-4">{error}</div>
    </div>
  );
};
