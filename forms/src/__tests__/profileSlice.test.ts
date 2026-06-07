import { describe, expect, it } from "vitest";

import profileReducer, { addSubmission } from "@/store/profileSlice";
import { type FormValues } from "@/utils/ValidationSchema";

describe("Redux Profile Slice", () => {
  const dummyProfile: FormValues = {
    name: "John",
    age: 25,
    email: "john@test.com",
    gender: "male",
    acceptTerms: true,
    image: "data:image/png;base64,123",
    password: "Password1!",
    confirmPassword: "Password1!",
    country: "Canada",
  };

  it("should handle initial state", () => {
    expect(profileReducer(undefined, { type: "unknown" })).toEqual({
      submissions: [],
    });
  });

  it("should append submissions to the history array", () => {
    const prevState = { submissions: [] };
    const nextState = profileReducer(prevState, addSubmission(dummyProfile));

    expect(nextState.submissions).toHaveLength(1);
    expect(nextState.submissions[0]).toEqual(dummyProfile);
  });
});
