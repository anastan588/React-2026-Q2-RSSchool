import React, { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { FormCheckbox } from "@/components/FormCheckbox";
import { FormCountryAutocomplete } from "@/components/FormCountryAutocomplete";
import { FormImageUpload } from "@/components/FormImageUpload";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { PasswordIndicator } from "@/components/PasswordIndicator";
import type { UnifiedFormProps } from "@/types/types";
import { type FormValues, profileSchema } from "@/utils/ValidationSchema";

export const UnifiedForm: React.FC<UnifiedFormProps> = ({
  type,
  onSubmitSuccess,
}) => {
  const isRHF = type === "rhf";

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    clearErrors,
    formState: { errors: rhfErrors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      age: undefined,
      email: "",
      gender: undefined,
      acceptTerms: false,
      image: "",
      password: "",
      confirmPassword: "",
      country: "",
    } as unknown as FormValues,
  });

  const watchPassword = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const watchCountry = useWatch({ control, name: "country", defaultValue: "" });

  const [uncErrors, setUncErrors] = useState<Record<string, string>>({});
  const [uncPassValue, setUncPassValue] = useState<string>("");
  const [uncCountryQuery, setUncCountryQuery] = useState<string>("");
  const [uncImageBase64, setUncImageBase64] = useState<string>("");

  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isInvalidType = !["image/png", "image/jpeg"].includes(file.type);
    const isInvalidSize = file.size > 2 * 1024 * 1024;

    if (isRHF) {
      if (isInvalidType) {
        setError("image", {
          type: "manual",
          message: "Only PNG or JPEG allowed",
        });
        setValue("image", "");
        return;
      }
      if (isInvalidSize) {
        setError("image", {
          type: "manual",
          message: "Image must be under 2MB",
        });
        setValue("image", "");
        return;
      }
      clearErrors("image");
    } else {
      if (isInvalidType) {
        setUncErrors((prev) => ({
          ...prev,
          image: "Only PNG or JPEG allowed",
        }));
        return;
      }
      if (isInvalidSize) {
        setUncErrors((prev) => ({ ...prev, image: "Image must be under 2MB" }));
        return;
      }
      setUncErrors((prev) => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (isRHF) {
          setValue("image", reader.result, { shouldValidate: true });
        } else {
          setUncImageBase64(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUncontrolledSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rawAge = ageRef.current?.value;
    const rawData = {
      name: nameRef.current?.value || "",
      age: rawAge === "" || rawAge === undefined ? undefined : Number(rawAge),
      email: emailRef.current?.value || "",
      gender:
        genderRef.current?.value === "" ? undefined : genderRef.current?.value,
      acceptTerms: termsRef.current?.checked || false,
      image: uncImageBase64,
      password: passwordRef.current?.value || "",
      confirmPassword: confirmPasswordRef.current?.value || "",
      country: uncCountryQuery,
    };

    const result = profileSchema.safeParse(rawData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldKey = issue.path[0];
        if (fieldKey !== undefined) {
          formattedErrors[fieldKey.toString()] = issue.message;
        }
      });
      setUncErrors(formattedErrors);
    } else {
      setUncErrors({});
      onSubmitSuccess(result.data as FormValues);
    }
  };

  return (
    <form
      className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
      onSubmit={
        isRHF ? handleSubmit(onSubmitSuccess) : handleUncontrolledSubmit
      }
    >
      <FormInput
        error={isRHF ? rhfErrors.name?.message : uncErrors.name}
        id="field-name"
        inputRef={nameRef}
        isRHF={isRHF}
        label="Name"
        name="name"
        register={register}
      />
      <FormInput
        valueAsNumber
        error={isRHF ? rhfErrors.age?.message : uncErrors.age}
        id="field-age"
        inputRef={ageRef}
        isRHF={isRHF}
        label="Age"
        name="age"
        register={register}
        type="number"
      />
      <FormInput
        error={isRHF ? rhfErrors.email?.message : uncErrors.email}
        id="field-email"
        inputRef={emailRef}
        isRHF={isRHF}
        label="Email"
        name="email"
        register={register}
      />

      <FormSelect
        error={isRHF ? rhfErrors.gender?.message : uncErrors.gender}
        id="field-gender"
        isRHF={isRHF}
        label="Gender"
        name="gender"
        register={register}
        selectRef={genderRef}
      />
      <FormImageUpload
        error={isRHF ? rhfErrors.image?.message : uncErrors.image}
        id="field-image"
        isRHF={isRHF}
        label="Profile Image"
        name="image"
        register={register}
        onChange={handleImageFileChange}
      />

      <div>
        <FormInput
          error={isRHF ? rhfErrors.password?.message : uncErrors.password}
          id="field-password"
          inputRef={passwordRef}
          isRHF={isRHF}
          label="Password"
          name="password"
          register={register}
          type="password"
          onChange={(e) => {
            if (isRHF) {
              setValue("password", e.target.value, { shouldValidate: true });
            } else {
              setUncPassValue(e.target.value);
            }
          }}
        />
        <PasswordIndicator value={isRHF ? watchPassword : uncPassValue} />
      </div>

      <FormInput
        error={
          isRHF ? rhfErrors.confirmPassword?.message : uncErrors.confirmPassword
        }
        id="field-confirmPassword"
        inputRef={confirmPasswordRef}
        isRHF={isRHF}
        label="Confirm Password"
        name="confirmPassword"
        register={register}
        type="password"
      />

      <FormCountryAutocomplete
        error={isRHF ? rhfErrors.country?.message : uncErrors.country}
        id="field-country"
        isRHF={isRHF}
        label="Country Autocomplete"
        name="country"
        register={register}
        value={isRHF ? watchCountry : uncCountryQuery}
        onChangeUncontrolled={(e) => {
          if (isRHF) {
            setValue("country", e.target.value, { shouldValidate: true });
          } else {
            setUncCountryQuery(e.target.value);
          }
        }}
        onSelect={(c) => {
          if (isRHF) {
            setValue("country", c, { shouldValidate: true });
          } else {
            setUncCountryQuery(c);
          }
        }}
      />

      <FormCheckbox
        id="field-terms"
        label="Accept Terms and Conditions"
        name="acceptTerms"
        isRHF={isRHF}
        register={register}
        checkboxRef={termsRef}
        error={
          isRHF
            ? rhfErrors.acceptTerms?.message
            : uncErrors.acceptTerms || undefined
        }
      />

      <button
        type="submit"
        disabled={isRHF ? !isValid : undefined}
        className={`w-full justify-center rounded-md py-2 px-4 text-sm font-semibold text-white shadow-sm transition-opacity ${
          isRHF
            ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        Submit
      </button>
    </form>
  );
};
