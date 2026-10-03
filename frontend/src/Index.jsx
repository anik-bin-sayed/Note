import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Notes from "./pages/AllNotes";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NoteDetails from "./pages/NoteDetails";
import PublicSharedNote from "./pages/PublicSharedNote";
import Settings from "./pages/Settings";
import ApplicationLayout from "./components/ApplicationLayout";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Spreadsheets from "./pages/spreadsheets/Spreadsheets";
import SpreadsheetEditor from "./pages/spreadsheets/SpreadsheetEditor";

const Index = () => {
  return (
    <Routes>
      <Route path="/s/:token" element={<PublicSharedNote />} />

      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route element={<ApplicationLayout />}>
        <Route path="/spreadsheets" element={<Spreadsheets />} />
        <Route path="/spreadsheets/:id" element={<SpreadsheetEditor />} />

        <Route element={<ProtectedRoute requireVault={false} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
