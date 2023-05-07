import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
  Textarea,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

import { UserAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { ethers } from "ethers";

export function VerifyEmail() {
  const { resendVerificationEmail, user, isLoggedIn } = UserAuth();
  const navigate = useNavigate();

  const resend = () => {
    resendVerificationEmail();
  };

  useEffect(() => {
    if (localStorage.getItem("isVerified") == "true")
      navigate("/dashboard/home");
  }, []);

  useEffect(() => {
    check_login_status();
  }, []);

  const check_login_status = async () => {
    if (!isLoggedIn()) {
      navigate("/sign-in");
    }
  };

  return (
    <>
      <div className="container-fluid mx-auto  flex min-h-screen items-center justify-center  bg-black/80 p-4">
        <div>
          <Card className=" mx-auto w-full max-w-[30rem]">
            <img src="./img/logo.png" />
            <Typography
              variant="h5"
              color="white"
              className="text-center font-medium text-black/70"
            >
              Email Verification
            </Typography>
            <Typography
              variant="base"
              className="mt-6 flex justify-center font-medium"
            >
              Click the Link in the Email to verify your account.
            </Typography>
            <CardFooter className="pt-0">
              <Typography variant="small" className="mt-6 flex justify-center">
                Did not receive the Email?
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 cursor-pointer font-bold"
                  onClick={resend}
                >
                  Resend
                </Typography>
              </Typography>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

export default VerifyEmail;
