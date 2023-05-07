import React from "react";
import { render } from "react-dom";
import { Navigate } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user } = UserAuth();

  if (isLoggedIn())
    return localStorage.getItem("isVerified") == "true" ? (
      children
    ) : (
      <Navigate to="/verify-email" />
    );
  else return <Navigate to="/sign-in" />;
};
export default ProtectedRoute;
