import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleRedirect from "./routes/RoleRedirect";
import LandingPage from "./pages/LandingPage";

import DashboardLayout from "./pages/DashboardLayout";

import {CreateClientProfile, CreateWorkerProfile} from "./pages/CreateProfile";
import {ClientDashboard, WorkerDashboard} from "./pages/Dashboard";


import {CreateShiftPage, EditShift} from "./pages/CreateShiftPage";
import ShiftListPage from "./pages/ShiftListPage";
import ShiftDetailPage from "./pages/ShiftDetailPage";
import ClientMyShiftsPage from "./pages/ClientMyShiftsPage";
import WorkerMyApplicationsPage from "./pages/WorkerMyApplicationsPage";
import ShiftApplicantsPage from "./pages/ShiftApplicantsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatListPage from "./pages/ChatListPage";
import ChatPage from "./pages/ChatPage";


function App(){
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout/>}>
              <Route path="/redirect-by-role" element={<RoleRedirect />} />
              <Route path="/create-client-profile" element={<CreateClientProfile />} />
              <Route path="/create-worker-profile" element={<CreateWorkerProfile />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />

              <Route path="/client/shifts/create" element={<CreateShiftPage />} />
              <Route path="/client/shifts" element={<ClientMyShiftsPage />} />
              <Route path="/client/shifts/:shiftId/applicants" element={<ShiftApplicantsPage />} />
              <Route path="/client/shifts/:shiftId/edit" element={<EditShift/>}></Route>

              <Route path="/shifts" element={<ShiftListPage />} />
              <Route path="/shifts/:shiftId" element={<ShiftDetailPage />} />
              <Route path="/worker/applications" element={<WorkerMyApplicationsPage />} />
              
              <Route path="/profile" element={<ProfilePage />} />


              <Route path="/messages" element={<ChatListPage />} />
              <Route path="/messages/:conversationId" element={<ChatPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
