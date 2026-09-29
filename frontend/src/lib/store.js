import { configureStore } from "@reduxjs/toolkit";
import { noteApi } from "./features/noteApi";

export const store = configureStore({
  reducer: {
    [noteApi.reducerPath]: noteApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(noteApi.middleware),
});
