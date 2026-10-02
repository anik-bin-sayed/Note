import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseApi";
import { decryptNote, encryptNote } from "../../vaultCrypto";

const customError = (error) => ({
  error: {
    status: "CUSTOM_ERROR",
    error:
      error instanceof Error
        ? error.message
        : "Could not process encrypted note data.",
  },
});

const decryptEntry = async (entry, baseQuery) => {
  let encryptedEntry = entry;

  if (typeof entry.legacy_title === "string") {
    const encrypted = await encryptNote({
      title: entry.legacy_title,
      text: entry.legacy_text,
    });
    const migration = await baseQuery({
      url: `/entries/${entry.id}`,
      method: "PUT",
      body: encrypted,
    });

    if (migration.error) {
      throw new Error(
        "A legacy note could not be encrypted. Reload to retry its migration.",
      );
    }

    encryptedEntry = migration.data;
  }

  const note = await decryptNote(encryptedEntry);
  return { ...encryptedEntry, ...note };
};

const decryptEntries = (entries, baseQuery) =>
  Promise.all(entries.map((entry) => decryptEntry(entry, baseQuery)));

const getAllNotes = async (
  { page = 1, limit = 9, search = "" } = {},
  baseQuery,
) => {
  const allEntries = [];
  let totalPages = 1;

  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    const result = await baseQuery({
      url: "/entries",
      method: "GET",
      params: { page: currentPage, limit: 100 },
    });

    if (result.error) return result;

    allEntries.push(...result.data.items);
    totalPages = result.data.total_pages;
  }

  try {
    const notes = await decryptEntries(allEntries, baseQuery);
    const term = search.trim().toLocaleLowerCase();
    const matching = term
      ? notes.filter(
          ({ title, text }) =>
            title.toLocaleLowerCase().includes(term) ||
            text.toLocaleLowerCase().includes(term),
        )
      : notes;
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const start = (page - 1) * safeLimit;

    return {
      data: {
        items: matching.slice(start, start + safeLimit),
        page,
        limit: safeLimit,
        total: matching.length,
        total_pages: Math.max(1, Math.ceil(matching.length / safeLimit)),
      },
    };
  } catch (error) {
    return customError(error);
  }
};

const migrateLegacyNotes = async (baseQuery) => {
  let totalPages = 1;
  let migratedCount = 0;

  for (let page = 1; page <= totalPages; page += 1) {
    const result = await baseQuery({
      url: "/entries",
      method: "GET",
      params: { page, limit: 100 },
    });

    if (result.error) return result;

    totalPages = result.data.total_pages;
    const legacyEntries = result.data.items.filter(
      (entry) => typeof entry.legacy_title === "string",
    );

    try {
      await Promise.all(
        legacyEntries.map(async (entry) => {
          const encrypted = await encryptNote({
            title: entry.legacy_title,
            text: entry.legacy_text,
          });
          const update = await baseQuery({
            url: `/entries/${entry.id}`,
            method: "PUT",
            body: encrypted,
          });

          if (update.error) {
            throw new Error(`Could not encrypt legacy note ${entry.id}.`);
          }
        }),
      );
      migratedCount += legacyEntries.length;
    } catch (error) {
      return customError(error);
    }
  }

  return { data: { migrated: migratedCount } };
};

export const noteApi = createApi({
  reducerPath: "noteApi",

  baseQuery: baseQueryWithReauth,
  tagTypes: ["Note"],
  endpoints: (builder) => ({
    getDashboardNotes: builder.query({
      queryFn: async (_argument, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: "/entries",
          method: "GET",
          params: { page: 1, limit: 6 },
        });

        if (result.error) return result;

        try {
          return {
            data: {
              ...result.data,
              items: await decryptEntries(result.data.items, baseQuery),
            },
          };
        } catch (error) {
          return customError(error);
        }
      },
      providesTags: ["Note"],
    }),

    getAllNotes: builder.query({
      queryFn: async (argument, _api, _extraOptions, baseQuery) =>
        getAllNotes(argument, baseQuery),
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
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ url: `/entries/${id}`, method: "GET" });

        if (result.error) return result;

        try {
          return { data: await decryptEntry(result.data, baseQuery) };
        } catch (error) {
          return customError(error);
        }
      },
      providesTags: ["Note"],
    }),

    createNote: builder.mutation({
      queryFn: async (note, _api, _extraOptions, baseQuery) => {
        try {
          const encrypted = await encryptNote(note);
          return baseQuery({ url: "/entries", method: "POST", body: encrypted });
        } catch (error) {
          return customError(error);
        }
      },
      invalidatesTags: ["Note"],
    }),

    migrateLegacyNotes: builder.query({
      queryFn: async (_argument, _api, _extraOptions, baseQuery) =>
        migrateLegacyNotes(baseQuery),
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
