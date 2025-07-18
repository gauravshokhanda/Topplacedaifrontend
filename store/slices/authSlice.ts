import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  user: null as null | {
    id: string;
    email: string;
    role: string;
    name?: string;
    experience?: string;
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      console.log("Login successfully:", action.payload.user);
    },
    logout(state) {
      state.token = "";
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
