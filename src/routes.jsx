import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { EditProfile } from "./pages/dashboard/edit-profile";
import { Orders } from "./pages/dashboard/orders";
import CreateOrder from "./pages/dashboard/create-order";
import OrderDetails from "./pages/dashboard/order-details";
import OrderConfirmation from "./pages/dashboard/order-confirmation";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Profile />,
        className: "hidden",
        // element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "swap",
        path: "/swap",
        element: <Orders />,
      },
      // {
      //   icon: <ArrowRightOnRectangleIcon {...icon} />,
      //   name: "logout",
      //   path: "/notifactions",
      //   element: <Notifications />,
      //   // className: "hidden",
      // },
      {
        name: "edit profile",
        path: "/edit-profile",
        element: <EditProfile />,
        className: "hidden",
      },
      {
        name: "new swap",
        path: "/new-swap",
        element: <CreateOrder />,
        className: "hidden",
      },
      {
        name: "swap details",
        path: "/swap-details",
        element: <OrderDetails />,
        className: "hidden",
      },
      {
        name: "swap confirmation",
        path: "/swap-confirmation",
        element: <OrderConfirmation />,
        className: "hidden",
      },
    ],
  },
];

export default routes;
