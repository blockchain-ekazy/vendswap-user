import React from "react";
import { render } from "react-dom";
import { Navigate } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = UserAuth();
  return isLoggedIn() ? children : <Navigate to="/sign-in" />;
};
export default ProtectedRoute;
