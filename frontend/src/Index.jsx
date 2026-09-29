import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Notes from "./pages/AllNotes";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NoteDetails from "./pages/NoteDetails";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const Index = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
