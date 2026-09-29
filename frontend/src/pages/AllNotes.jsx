import { useMemo, useState } from "react";
import { FiBookOpen, FiRefreshCw } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingNote from "../components/Note/LoadingNote";
import ListEntry from "../components/Note/ListEntry";
import Pagination from "../components/Note/AllNotes/Pagination";
import Empty from "../components/Note/Empty";
import {
  useDeleteEntryMutation,
  useGetAllNotesQuery,
} from "../lib/features/noteApi";
import { useSearchParams } from "react-router-dom";
import Search from "../components/Note/AllNotes/Search";

const Notes = () => {
  const { user, logout } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");

  const limit = 9;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useGetAllNotesQuery({
    page,
    limit,
    search,
  });
  const [deleteEntry, { isLoading: deleting }] = useDeleteEntryMutation();

  const entries = data?.items;
  const total = data?.total;
  const totalPages = data?.total_pages ?? 1;

  // search suggestion
  const suggestionTitles = useMemo(() => {
    const value = searchInput.trim().toLowerCase();

    if (!value) {
      return [];
    }

    const titles = entries
      .map((entry) => entry.title)
      .filter(Boolean)
      .filter((title) => title.toLowerCase().includes(value));

    return [...new Set(titles)].slice(0, 6);
  }, [entries, searchInput]);

  // search submit
  const handleSearchSubmit = (nextValue = searchInput) => {
    const normalized = nextValue.trim();

    const params = new URLSearchParams(searchParams);

    if (normalized) {
      params.set("q", normalized);
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    setSearchParams(params);
    setShowSuggestions(false);
  };

  const handleDeleteEntry = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(id).unwrap();
      if (entries.length === 1 && page > 1) {
        setSearchParams({
          page: String(page - 1),
        });
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.detail || "Failed to delete entry.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar user={user} logout={logout} />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <FiBookOpen className="text-slate-500" />
            Personal Knowledge Base
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Notes
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage all your saved words, concepts, definitions and notes.
          </p>
        </div>

        {/* Search */}
        <Search
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setShowSuggestions={setShowSuggestions}
          handleSearchSubmit={handleSearchSubmit}
          showSuggestions={showSuggestions}
          suggestionTitles={suggestionTitles}
        />

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        )}

        {/* Count */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Entries</h2>

            <p className="mt-1 text-sm text-slate-500">
              {total} {total === 1 ? "entry" : "entries"} in your Notes
            </p>
          </div>

          <div>
            <button
              onClick={() => refetch()}
              className="border px-4 py-2 rounded cursor-pointer bg-white border-gray-300"
            >
              Reload
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <LoadingNote />}

        {/* Empty */}
        {!isLoading && entries?.length === 0 && (
          <Empty search={submittedSearch || searchInput} />
        )}

        {/* Entries */}
        <div className="border border-gray-300 py-4 px-2 lg:px-8 rounded-xl bg-gray-100">
          {!isLoading && entries?.length > 0 && (
            <ListEntry
              entries={entries}
              handleDeleteNote={handleDeleteEntry}
              deleting={deleting}
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={(newPage) => {
              setSearchParams({ page: String(newPage) });
            }}
          />
        )}
      </section>
    </main>
  );
};

export default Notes;
