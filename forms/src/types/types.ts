import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import type { FormValues } from "@/utils/ValidationSchema";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Australia",
  "Ukraine",
  "Poland",
];

export interface FormInputProps<T extends FieldValues> {
  id: string;
  label: string;
  type?: "text" | "number" | "password";
  error?: string;
  isRHF: boolean;
  register?: UseFormRegister<T>;
  name: Path<T>;
  valueAsNumber?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FormSelectProps<T extends FieldValues> {
  id: string;
  label: string;
  error?: string;
  isRHF: boolean;
  register?: UseFormRegister<T>;
  name: Path<T>;
  selectRef?: React.RefObject<HTMLSelectElement | null>;
}

export interface Props {
  onSubmitSuccess: (data: FormValues) => void;
}

export interface FormImageUploadProps<T extends FieldValues> {
  id: string;
  label: string;
  error?: string;
  isRHF: boolean;
  register?: UseFormRegister<T>;
  name: Path<T>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FormCheckboxProps<T extends FieldValues> {
  id: string;
  label: string;
  error?: string | null;
  isRHF: boolean;
  register?: UseFormRegister<T>;
  name: Path<T>;
  checkboxRef?: React.RefObject<HTMLInputElement | null>;
}

export interface FormCountryAutocompleteProps<T extends FieldValues> {
  id: string;
  label: string;
  error?: string;
  isRHF: boolean;
  register?: UseFormRegister<T>;
  name: Path<T>;
  value: string;
  onSelect: (country: string) => void;
  onChangeUncontrolled?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface UnifiedFormProps {
  type: "uncontrolled" | "rhf";
  onSubmitSuccess: (data: FormValues) => void;
}
