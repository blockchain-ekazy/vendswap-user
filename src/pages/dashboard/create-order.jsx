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
  Select,
  Option,
  Radio,
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

export function CreateOrder() {
  const navigate = useNavigate();
  const { createOrder } = UserAuth();
  const [data, setData] = useState({});

  async function handleSubmit() {
    let d = String(Date.now());
    await createOrder(data, d);
  }

  return (
    <>
      <Card className="mx-3 mt-8 mb-6 lg:mx-4">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Input
                type="number"
                label="How many devices are you transferring?"
                size="lg"
                value={data["How many devices are you transferring?"]}
                onChange={(e) =>
                  setData({
                    ...data,
                    "How many devices are you transferring?": e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Select
                type="text"
                label="Are you using Cantaloupe or Nayax or other?"
                size="lg"
                value={data["Are you using Cantaloupe or Nayax or other?"]}
                onChange={(e) => {
                  setData({
                    ...data,
                    "Are you using Cantaloupe or Nayax or other?": e,
                  });
                }}
              >
                <Option value="Cantaloupe">Cantaloupe</Option>
                <Option value="Nayax">Nayax</Option>
                <Option value="other">other</Option>
              </Select>
            </div>
            <div>
              <Input
                type="text"
                label="Pos Account Number"
                size="lg"
                value={data["Pos Account Number"]}
                onChange={(e) =>
                  setData({ ...data, "Pos Account Number": e.target.value })
                }
              />
            </div>
            <div>
              <Input
                type="text"
                label="What's your monthly revenue per device?"
                size="lg"
                value={data["What's your monthly revenue per device?"]}
                onChange={(e) =>
                  setData({
                    ...data,
                    "What's your monthly revenue per device?": e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal"
              >
                Are you able to provide the Swap escrow?
              </Typography>
              <Radio
                id="1"
                name="type"
                label="Yes"
                onClick={(e) =>
                  setData({
                    ...data,
                    "Are you able to provide the Swap escrow?": "Yes",
                  })
                }
              />
              <Radio
                id="2"
                name="type"
                label="No"
                onClick={(e) =>
                  setData({
                    ...data,
                    "Are you able to provide the Swap escrow": "No",
                  })
                }
              />
            </div>
            <div>
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal"
              >
                Do you have a current escrow provider?
              </Typography>
              <Radio
                id="3"
                name="type2"
                label="Yes"
                onClick={(e) =>
                  setData({
                    ...data,
                    "Do you have a current escrow provider?": "Yes",
                  })
                }
              />
              <Radio
                id="4"
                name="type2"
                label="No"
                onClick={(e) =>
                  setData({
                    ...data,
                    "Do you have a current escrow provider?": "No",
                  })
                }
              />
            </div>

            <div>
              <Input
                type="email"
                label="Buyer Email"
                size="lg"
                value={data["Buyer Email"]}
                onChange={(e) =>
                  setData({
                    ...data,
                    "Buyer Email": e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Button
                variant="outlined"
                size="md"
                onClick={() => navigate("/dashboard/swap")}
                className="mx-1"
              >
                CANCEL
              </Button>

              <button
                className="rounded-lg bg-blue-500 py-3 px-6 text-xs font-bold text-white"
                onClick={() => handleSubmit()}
              >
                SUBMIT
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default CreateOrder;
