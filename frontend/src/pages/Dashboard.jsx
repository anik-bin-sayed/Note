// react
import { useState } from "react";

// react router dom
import { useSearchParams } from "react-router-dom";

// rtk query
import {
  useDeleteEntryMutation,
  useGetDashboardNotesQuery,
} from "../lib/features/noteApi";

// Local components
import Empty from "../components/Note/Empty";
import { useAuth } from "../context/AuthContext";
import ListEntry from "../components/Note/ListEntry";
import Stats from "../components/Note/Dashboard/Stats";
import Error from "../components/Note/Dashboard/Error";
import LoadingNote from "../components/Note/LoadingNote";
import Header from "../components/Note/Dashboard/Header";
import CreateNoteModal from "../components/Note/Dashboard/CreateNoteModal";

const EMPTY_ENTRIES = [];
const getNotesErrorMessage = (error) => {
  if (typeof error?.data?.detail === "string") return error.data.detail;
  if (typeof error?.data === "string") return error.data;
  if (typeof error?.error === "string") return error.error;
  if (error?.status) return `Could not load notes (HTTP ${error.status}).`;
  return "Could not load your notes. Try again.";
};

const Dashboard = () => {
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);

  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const {
    data,
    isLoading,
    refetch,
    isError,
    error: notesError,
  } = useGetDashboardNotesQuery();
  const [deleteEntry, { isLoading: deleting }] = useDeleteEntryMutation();

  console.log(data, isLoading, isError, notesError);

  const entries = data?.items ?? EMPTY_ENTRIES;

  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(id);
      if (entries.length === 1 && page > 1) {
        setSearchParams({
          page: String(page - 1),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <Header user={user} setShowAddModal={setShowAddModal} />

        {/* Error */}
        {isError && (
          <Error
            error={getNotesErrorMessage(notesError)}
            fetchEntries={refetch}
          />
        )}

        {/* Stats */}
        <Stats entries={entries} search={search} setSearch={setSearch} />

        {/* Loading */}
        {isLoading && <LoadingNote />}

        {/* Empty */}
        {!isLoading && !isError && entries.length === 0 && (
          <Empty search={search} setShowAddModal={setShowAddModal} />
        )}

        {/* Entries */}
        <div className="border border-gray-300 py-4 px-2 lg:px-8 rounded-xl bg-gray-100">
          {!isLoading && !isError && entries.length > 0 && (
            <ListEntry
              entries={entries}
              handleDeleteNote={handleDeleteNote}
              deleting={deleting}
            />
          )}
        </div>
      </section>

      {/* Add Entry Modal */}
      {showAddModal && <CreateNoteModal setShowAddModal={setShowAddModal} />}
    </main>
  );
};

export default Dashboard;
