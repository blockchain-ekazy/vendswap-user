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

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [data, setData] = useState({});

  const { createUser, isLoggedIn } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    check_login_status();
  }, []);

  const check_login_status = async () => {
    if (isLoggedIn()) {
      navigate("/dashboard/home");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password != password2) {
      toast.error("Passwords do not match");
      return;
    }
    if (!ethers.isAddress(data["Wallet Address"])) {
      toast.error("Invalid Wallet Address");
      return;
    }

    try {
      await createUser(email, password, data);
      navigate("/dashboard/home");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      {/* <div className="absolute inset-0 z-0 min-h-full w-full bg-black/80" /> */}
      <div className="container-fluid mx-auto bg-black/80 p-4">
        <Card className=" mx-auto w-full max-w-[32rem]">
          <img src="./img/logo.png" />
          <Typography
            variant="h3"
            color="white"
            className="text-center text-black"
          >
            Sign Up
          </Typography>
          <form onSubmit={(e) => handleSubmit(e)}>
            <CardBody className="flex flex-col gap-4 pb-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    required
                    type="text"
                    label="First Name"
                    size="lg"
                    value={data["First Name"]}
                    onChange={(e) =>
                      setData({ ...data, "First Name": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    required
                    type="text"
                    label="Last Name"
                    size="lg"
                    value={data["Last Name"]}
                    onChange={(e) =>
                      setData({ ...data, "Last Name": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    required
                    type="text"
                    label="Business Name"
                    size="lg"
                    value={data["Business Name"]}
                    onChange={(e) =>
                      setData({ ...data, "Business Name": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    required
                    type="text"
                    label="Phone"
                    size="lg"
                    value={data["Phone"]}
                    onChange={(e) =>
                      setData({ ...data, Phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    required
                    type="text"
                    label="Tax ID"
                    size="lg"
                    value={data["Tax ID"]}
                    onChange={(e) =>
                      setData({ ...data, "Tax ID": e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    required
                    type="text"
                    label="Wallet Address"
                    size="lg"
                    value={data["Wallet Address"]}
                    onChange={(e) =>
                      setData({ ...data, "Wallet Address": e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    required
                    label="Address"
                    size="lg"
                    value={data["Address"]}
                    onChange={(e) =>
                      setData({ ...data, Address: e.target.value })
                    }
                  />
                </div>
              </div>

              <hr />

              <Input
                type="email"
                label="Email"
                size="lg"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setData({ ...data, Email: e.target.value });
                }}
              />

              <Input
                required
                type="password"
                label="Password"
                size="lg"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                required
                type="password"
                label="Confirm Password"
                size="lg"
                onChange={(e) => setPassword2(e.target.value)}
              />

              <button className="rounded-lg bg-blue-500 p-3 text-xs font-bold text-white">
                SIGN UP
              </button>
            </CardBody>
          </form>
          <CardFooter className="pt-0">
            <Typography variant="small" className="mt-6 flex justify-center">
              Already have an account?
              <Link to="/sign-in">
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 font-bold"
                >
                  Sign in
                </Typography>
              </Link>
            </Typography>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignUp;
