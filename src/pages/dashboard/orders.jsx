import {
  Card,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { authorsTableData, projectsTableData } from "@/data";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const { user } = UserAuth();

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    let res = await getDocs(collection(db, "orders"));
    let o = [];
    res.forEach((order) => {
      o.push({ ...order.data() });
    });
    setOrders(o);
  }

  return (
    <div className="mt-12 mb-8 ">
      <Button
        variant="filled"
        size="md"
        onClick={() => navigate("/dashboard/new-swap")}
        className="ml-auto mr-2 mb-2 block"
      >
        New Swap
      </Button>
      <Card>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["ID", "Seller", "Escrow Status", "Progress", "Date"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, key) => {
                const className = `py-3 px-5`;
                if (o.seller == user.email || o["Buyer Email"] == user.email)
                  return (
                    <tr
                      className="cursor-pointer hover:bg-blue-gray-50"
                      key={key}
                      onClick={() => {
                        navigate("/dashboard/swap-details?id=" + o.id);
                      }}
                    >
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {o.id}
                            </Typography>
                            {/* <Typography className="text-xs font-normal text-blue-gray-500">
                            {email}
                          </Typography> */}
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {o.seller}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={
                            o["Escrow Paid"] == "Yes" ? "green" : "blue-gray"
                          }
                          value={o["Escrow Paid"] == "Yes" ? "Paid" : "Unpaid"}
                          className="py-0.5 px-2 text-[11px] font-medium"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {o.progress.status}%
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          as="a"
                          href="#"
                          className="text-xs font-semibold text-blue-gray-600"
                        >
                          {new Date(+o.id).toLocaleString()}
                        </Typography>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Orders;
