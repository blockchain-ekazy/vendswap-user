import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import { SignIn, SignUp } from "./pages/auth";
import { AuthContextProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import { VerifyEmail } from "./pages/auth/verify-email";
import { useEffect } from "react";

function App() {
  useEffect(() => init(), []);

  // async
  function init() {
    {
      Dynamsoft.DBR.BarcodeScanner.license =
        "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAyMDI4NTg0LVRYbFhaV0pRY205cVgyUmljZyIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAyMDI4NTg0IiwiY2hlY2tDb2RlIjotMTYzMjYxODAxNn0=";
      // await Dynamsoft.DBR.BarcodeScanner.loadWasm();
    }
  }

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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
      </Routes>
      <ToastContainer theme="colored" hideProgressBar={true} />
    </AuthContextProvider>
  );
}

export default App;
