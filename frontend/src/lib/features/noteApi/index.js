import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseApi";

export const noteApi = createApi({
  reducerPath: "noteApi",

  baseQuery: baseQueryWithReauth,
  tagTypes: ["Note"],
  endpoints: (builder) => ({
    getDashboardNotes: builder.query({
      query: () => ({
        url: `/entries?page=1&limit=6`,
        method: "GET",
      }),
      providesTags: ["Note"],
    }),

    getAllNotes: builder.query({
      query: ({ page = 1, limit, search = "" } = {}) => ({
        url: `/entries`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Note"],
    }),

    deleteEntry: builder.mutation({
      query: (id) => ({
        url: `/entries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Note"],
    }),

    getNoteDetails: builder.query({
      query: (id) => ({
        url: `/entries/${id}`,
        method: "GET",
      }),
      providesTags: ["Note"],
    }),

    // create free videos
    createNote: builder.mutation({
      query: (data) => ({
        url: `/entries`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Note"],
    }),
  }),
});

export const {
  useGetDashboardNotesQuery,
  useGetAllNotesQuery,
  useDeleteEntryMutation,
  useGetNoteDetailsQuery,
  useCreateNoteMutation,
} = noteApi;
