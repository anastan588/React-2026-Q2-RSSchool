import React from "react";

import { checkPasswordStrength } from "@/utils/FormHelpers";

export const PasswordIndicator: React.FC<{ value: string }> = ({ value }) => {
  const metrics = checkPasswordStrength(value);

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs h-10">
      <div
        className={`flex items-center ${metrics.hasNumber ? "text-emerald-600" : "text-gray-400"}`}
      >
        <span className="mr-1">{metrics.hasNumber ? "✓" : "○"}</span> 1 number
      </div>
      <div
        className={`flex items-center ${metrics.hasUpper ? "text-emerald-600" : "text-gray-400"}`}
      >
        <span className="mr-1">{metrics.hasUpper ? "✓" : "○"}</span> 1 uppercase
      </div>
      <div
        className={`flex items-center ${metrics.hasLower ? "text-emerald-600" : "text-gray-400"}`}
      >
        <span className="mr-1">{metrics.hasLower ? "✓" : "○"}</span> 1 lowercase
      </div>
      <div
        className={`flex items-center ${metrics.hasSpecial ? "text-emerald-600" : "text-gray-400"}`}
      >
        <span className="mr-1">{metrics.hasSpecial ? "✓" : "○"}</span> 1 special
        char
      </div>
    </div>
  );
};
