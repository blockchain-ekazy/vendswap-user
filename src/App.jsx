import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import { SignIn, SignUp } from "./pages/auth";
import { AuthContextProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
      </Routes>
      <ToastContainer theme="colored" hideProgressBar={true} />
    </AuthContextProvider>
  );
}

export default App;
