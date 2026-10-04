// react
import { useState } from "react";

// react router dom
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// react icons
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiFileText,
  FiGrid,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import DOMPurify from "dompurify";

// rtk query
import {
  useDeleteEntryMutation,
  useGetDashboardNotesQuery,
} from "../lib/features/noteApi";
import { useSpreadsheets } from "../context/SpreadsheetContext";
import { cellAddress, getCellValue } from "../lib/spreadsheetEngine";

// Local components
import { useAuth } from "../context/AuthContext";
import Error from "../components/Note/Dashboard/Error";
import CreateNoteModal from "../components/Note/Dashboard/CreateNoteModal";

const EMPTY_ENTRIES = [];
const EMPTY_WORKBOOKS = [];
const getNotesErrorMessage = (error) => {
  if (typeof error?.data?.detail === "string") return error.data.detail;
  if (typeof error?.data === "string") return error.data;
  if (typeof error?.error === "string") return error.error;
  if (error?.status) return `Could not load notes (HTTP ${error.status}).`;
  return "Could not load your notes. Try again.";
};

const getRelativeTime = (value) => {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Recently";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const getNotePreview = (text) =>
  DOMPurify.sanitize(text || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();

const Dashboard = () => {
  const { user } = useAuth();
  const { workbooks = EMPTY_WORKBOOKS, createSpreadsheet } = useSpreadsheets();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
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

  const entries = data?.items ?? EMPTY_ENTRIES;
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const recentEntries = [...entries]
    .sort(
      (left, right) =>
        Date.parse(right.updated_at || 0) - Date.parse(left.updated_at || 0),
    )
    .slice(0, 3);
  const recentWorkbooks = [...workbooks].sort(
    (left, right) =>
      Date.parse(right.updatedAt || 0) - Date.parse(left.updatedAt || 0),
  );
  const recentActivity = [
    ...entries.map((entry) => ({
      id: `note-${entry.id}`,
      title: entry.title,
      type: "Note",
      updatedAt: entry.updated_at,
      href: `/notes/${entry.id}`,
    })),
    ...workbooks.map((workbook) => ({
      id: `spreadsheet-${workbook.id}`,
      title: workbook.name,
      type: "Spreadsheet",
      updatedAt: workbook.updatedAt,
      href: `/spreadsheets/${workbook.id}`,
    })),
  ]
    .sort(
      (left, right) =>
        Date.parse(right.updatedAt || 0) - Date.parse(left.updatedAt || 0),
    )
    .slice(0, 4);

  const handleCreateSpreadsheet = () => {
    const workbook = createSpreadsheet();
    setShowCreateMenu(false);
    navigate(`/spreadsheets/${workbook.id}`);
  };

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
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-9 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <FiGrid className="text-sm text-sky-600" />
              Your workspace
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Good evening, {firstName} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Your personal workspace for notes, spreadsheets and everything you
              want to organize.
            </p>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={showCreateMenu}
              onClick={() => setShowCreateMenu((open) => !open)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
            >
              <FiPlus className="text-base" />
              Create New
            </button>
            {showCreateMenu && (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-full min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg sm:w-52"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowCreateMenu(false);
                    setShowAddModal(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FiFileText className="text-sky-600" />
                  New Note
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCreateSpreadsheet}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FiGrid className="text-emerald-600" />
                  New Spreadsheet
                </button>
              </div>
            )}
          </div>
        </header>

        {isError && (
          <Error
            error={getNotesErrorMessage(notesError)}
            fetchEntries={refetch}
          />
        )}

        <section aria-labelledby="quick-access-heading" className="mb-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="quick-access-heading"
                className="text-lg font-bold text-slate-900"
              >
                Quick Access
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pick up where you want to work.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-sky-700">
                    <FiFileText />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">Notes</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {isLoading
                        ? "Loading"
                        : `${entries.length} ${entries.length === 1 ? "note" : "notes"}`}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Personal
                </span>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
                Capture ideas, knowledge and important information.
              </p>
              <Link
                to="/notes"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-sky-700"
              >
                Open Notes <FiArrowRight />
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-emerald-700">
                    <FiGrid />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">Spreadsheets</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {workbooks.length}{" "}
                      {workbooks.length === 1 ? "spreadsheet" : "spreadsheets"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Workspace
                </span>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
                Organize data, track numbers and work with tables.
              </p>
              <Link
                to="/spreadsheets"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-emerald-700"
              >
                Open Spreadsheets <FiArrowRight />
              </Link>
            </article>
          </div>
        </section>

        <section aria-labelledby="recent-activity-heading" className="mb-9">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2
                id="recent-activity-heading"
                className="text-lg font-bold text-slate-900"
              >
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A little of what you have been working on.
              </p>
            </div>
            <FiClock aria-hidden="true" className="text-lg text-slate-400" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {recentActivity.length ? (
              recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  to={activity.href}
                  className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 transition hover:bg-slate-50 sm:px-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    {activity.type === "Note" ? <FiFileText /> : <FiGrid />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {activity.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {activity.type}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-slate-400">
                    <FiClock aria-hidden="true" className="mr-1 inline" />
                    {getRelativeTime(activity.updatedAt)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">
                Your recent work will appear here.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="spreadsheets-heading" className="mb-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="spreadsheets-heading"
                className="text-lg font-bold text-slate-900"
              >
                Your Spreadsheets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick look at your latest tables.
              </p>
            </div>
            <Link
              to="/spreadsheets"
              className="hidden items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:inline-flex"
            >
              View all <FiArrowRight />
            </Link>
          </div>
          {recentWorkbooks.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentWorkbooks.slice(0, 4).map((workbook) => {
                const sheet =
                  workbook.sheets?.find(
                    (item) => item.id === workbook.activeSheetId,
                  ) || workbook.sheets?.[0];
                const previewRows = Math.min(sheet?.rows || 0, 4);
                const previewColumns = Math.min(sheet?.columns || 0, 4);

                return (
                  <Link
                    key={workbook.id}
                    to={`/spreadsheets/${workbook.id}`}
                    aria-label={`Open spreadsheet ${workbook.name}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-emerald-700">
                        <FiGrid />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {workbook.name}
                        </h3>
                        <p className="truncate text-xs text-slate-500">
                          {sheet?.name || "Sheet1"}
                        </p>
                      </div>
                      <FiArrowRight
                        aria-hidden="true"
                        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
                      />
                    </div>
                    {sheet && previewRows > 0 && previewColumns > 0 ? (
                      <div className="overflow-hidden px-3 pt-3">
                        <table className="w-full table-fixed border-collapse text-left text-[10px]">
                          <tbody>
                            {Array.from({ length: previewRows }, (_, row) => (
                              <tr key={row}>
                                {Array.from(
                                  { length: previewColumns },
                                  (_, column) => {
                                    const address = cellAddress(row, column);
                                    let value = "";
                                    try {
                                      value = getCellValue(sheet, address);
                                    } catch {
                                      value = "";
                                    }
                                    return (
                                      <td
                                        key={address}
                                        className={`h-7 truncate border border-slate-200 px-1.5 ${row === 0 ? "bg-slate-100 font-semibold text-slate-700" : "text-slate-600"}`}
                                      >
                                        {value}
                                      </td>
                                    );
                                  },
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-3 pt-3">
                        <div className="grid h-28 grid-cols-4 grid-rows-4">
                          {Array.from({ length: 16 }, (_, index) => (
                            <span
                              key={index}
                              className="border border-slate-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500">
                      <span>
                        {workbook.columnCount} columns · {workbook.rowCount}{" "}
                        rows
                      </span>
                      <span>{getRelativeTime(workbook.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
              <p className="text-sm text-slate-500">No spreadsheets yet.</p>
              <button
                type="button"
                onClick={handleCreateSpreadsheet}
                className="mt-3 text-sm font-semibold text-slate-800 hover:text-emerald-700"
              >
                Create a spreadsheet
              </button>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-notes-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2
                id="recent-notes-heading"
                className="text-lg font-bold text-slate-900"
              >
                Recent Notes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest ideas and reference notes.
              </p>
            </div>
            <Link
              to="/notes"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Show More <FiArrowRight />
            </Link>
          </div>
          {isLoading ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0"
                >
                  <span className="h-9 w-9 rounded-lg bg-slate-100" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-1/3 rounded bg-slate-100" />
                    <span className="block h-3 w-2/3 rounded bg-slate-100" />
                  </span>
                </div>
              ))}
            </div>
          ) : !isError && recentEntries.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 sm:px-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sky-700">
                    <FiBookOpen />
                  </span>
                  <Link to={`/notes/${entry.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {entry.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {getNotePreview(entry.text) || "No description"}
                    </span>
                  </Link>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                    {getRelativeTime(entry.updated_at)}
                  </span>
                  {entry.role === "owner" && (
                    <button
                      type="button"
                      aria-label={`Delete ${entry.title}`}
                      onClick={() => handleDeleteNote(entry.id)}
                      disabled={deleting}
                      className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : !isError ? (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-500">
                No notes yet. Start with a thought worth keeping.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiPlus />
                Create a note
              </button>
            </div>
          ) : null}
        </section>
      </section>

      {showAddModal && <CreateNoteModal setShowAddModal={setShowAddModal} />}
    </main>
  );
};

export default Dashboard;
