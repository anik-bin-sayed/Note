// react router dom
import { useSearchParams } from "react-router-dom";

// react icons
import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiGrid,
  FiList,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

// redux rtk query
import {
  useDeleteEntryMutation,
  useGetAllNotesQuery,
} from "../lib/features/noteApi";

// local components
import Search from "../components/Note/AllNotes/Search";
import Pagination from "../components/Note/AllNotes/Pagination";
import NotesCollection from "../components/Note/AllNotes/NotesCollection";
import CreateNoteModal from "../components/Note/Dashboard/CreateNoteModal";

const EMPTY_ENTRIES = [];
const VIEW_STORAGE_KEY = "notes-list-view";

const getInitialView = () => {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "list"
      ? "list"
      : "grid";
  } catch {
    return "grid";
  }
};

const Notes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState(getInitialView);
  const [sortBy, setSortBy] = useState("recent");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      // Keep the selected view for this session when storage is unavailable.
    }
  }, [viewMode]);

  const limit = 9;
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, refetch } = useGetAllNotesQuery({
    page,
    limit,
    search,
  });
  const [deleteEntry, { isLoading: deleting }] = useDeleteEntryMutation();

  const entries = data?.items ?? EMPTY_ENTRIES;
  const total = data?.total ?? entries.length;
  const totalPages = data?.total_pages ?? 1;
  const sortedEntries = useMemo(() => {
    const ordered = [...entries];
    if (sortBy === "title") {
      return ordered.sort((left, right) =>
        (left.title || "").localeCompare(right.title || ""),
      );
    }
    if (sortBy === "oldest") {
      return ordered.sort(
        (left, right) =>
          Date.parse(left.updated_at || 0) - Date.parse(right.updated_at || 0),
      );
    }
    return ordered.sort(
      (left, right) =>
        Date.parse(right.updated_at || 0) - Date.parse(left.updated_at || 0),
    );
  }, [entries, sortBy]);

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

    setSearchInput(normalized);
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
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page - 1));
        setSearchParams(params);
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.detail || "Failed to delete entry.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <FiBookOpen className="text-sky-700" />
              Personal workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Notes
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Capture ideas, knowledge and everything worth remembering.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-600">
              {total} {total === 1 ? "note" : "notes"}
              {search && (
                <span className="font-normal text-slate-500">
                  {" "}
                  matching “{search}”
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <FiPlus />
            New Note
          </button>
        </header>

        <div className="mb-5">
          <Search
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            setShowSuggestions={setShowSuggestions}
            handleSearchSubmit={handleSearchSubmit}
            showSuggestions={showSuggestions}
            suggestionTitles={suggestionTitles}
          />
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">All notes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isLoading
                ? "Loading your notes"
                : `Page ${page} of ${totalPages}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="notes-sort">
              Sort notes
            </label>
            <select
              id="notes-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none hover:border-slate-300 focus:border-slate-400"
            >
              <option value="recent">Recently updated</option>
              <option value="oldest">Oldest updated</option>
              <option value="title">Title A–Z</option>
            </select>
            <div
              className="inline-flex h-10 rounded-lg border border-slate-200 bg-white p-1"
              role="group"
              aria-label="Notes view"
            >
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition ${viewMode === "grid" ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <FiGrid aria-hidden="true" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition ${viewMode === "list" ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <FiList aria-hidden="true" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Reload notes"
              title="Reload notes"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        <NotesCollection
          entries={sortedEntries}
          viewMode={viewMode}
          isLoading={isLoading}
          isEmpty={!isLoading && entries.length === 0}
          search={search || searchInput}
          onCreateNote={() => setShowAddModal(true)}
          onDelete={handleDeleteEntry}
          deleting={deleting}
        />

        {!isLoading && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={(newPage) => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(newPage));
              setSearchParams(params);
            }}
          />
        )}
      </section>
      {showAddModal && <CreateNoteModal setShowAddModal={setShowAddModal} />}
    </main>
  );
};

export default Notes;
