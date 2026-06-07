import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { FormValues } from "@/utils/ValidationSchema";

interface ProfileState {
  submissions: FormValues[];
}

const initialState: ProfileState = {
  submissions: [],
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    addSubmission: (state, action: PayloadAction<FormValues>) => {
      state.submissions.push(action.payload);
    },
  },
});

export const { addSubmission } = profileSlice.actions;
export default profileSlice.reducer;
