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
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { UserAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export function Profile() {
  const { user_data } = UserAuth();

  return (
    <>
      <Card className="mx-3 mt-8 mb-6 lg:mx-4">
        <CardBody className="p-4">
          <div className="mb-12 px-4">
            <ProfileInfoCard
              title="Profile Information"
              details={{
                "First Name": user_data["First Name"],
                "Last Name": user_data["Last Name"],
                Email: user_data["Email"],
                Phone: user_data["Phone"],
                "Tax ID": user_data["Tax ID"],
                "Business Name": user_data["Business Name"],
                Address: user_data["Address"],
                "Wallet Address": user_data["Wallet Address"],
              }}
              action={
                <Link to={"/dashboard/edit-profile"}>
                  <Tooltip content="Edit Profile">
                    <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                  </Tooltip>
                </Link>
              }
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
