import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

export function EditProfile() {
  const navigate = useNavigate();
  const { user_data, updateProfile } = UserAuth();
  const [data, setData] = useState({});

  useEffect(() => {
    setData(user_data);
  }, []);

  function handleSubmit() {
    if (!ethers.isAddress(data["Wallet Address"])) {
      toast.error("Invalid Wallet Address");
      return;
    }
  }

  return (
    <>
      <Card className="mx-3 mt-8 mb-6 lg:mx-4">
        <CardBody className="p-4">
          <form onSubmit={() => handleSubmit(data)}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
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
                  type="text"
                  label="Phone"
                  size="lg"
                  value={data["Phone"]}
                  onChange={(e) => setData({ ...data, Phone: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Wallet Address"
                  size="lg"
                  value={data["Wallet Address"]}
                  onChange={(e) =>
                    setData({ ...data, "Wallet Address": e.target.value })
                  }
                />
              </div>
              <div>
                <Input
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
                <Textarea
                  label="Address"
                  size="lg"
                  value={data["Address"]}
                  onChange={(e) =>
                    setData({ ...data, Address: e.target.value })
                  }
                />
              </div>
              <div>
                <Button
                  variant="outlined"
                  size="md"
                  onClick={() => navigate("/dashboard/profile")}
                  className="mx-1"
                >
                  Cancel
                </Button>

                <button className="rounded-lg bg-blue-500 py-3 px-6 text-xs font-bold text-white">
                  UPDATE
                </button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}

export default EditProfile;
