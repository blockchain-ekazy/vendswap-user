import {
  Card,
  CardBody,
  Button,
  Typography,
  Dialog,
} from "@material-tailwind/react";

import { useNavigate } from "react-router-dom";
import { ProfileInfoCard } from "@/widgets/cards";
import { UserAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { ethers } from "ethers";

import { toast } from "react-toastify";
import { usdt, usdtAMOUNT, vendswap, usdc } from "@/blockchain/config";
import vendswapAbi from "@/blockchain/vendswap.abi.json";
import usdtAbi from "@/blockchain/usdt.abi.json";
import {
  ArrowDownOnSquareStackIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  QrCodeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

export function OrderDetails() {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);

  const [order, setOrder] = useState({
    progress: { stages: [] },
    "Buyer Wallet": "",
    "Seller Wallet": "",
    "Escrow Tx": "",
    "Devices Serials Seller": [],
    "Devices Serials Buyer": [],
  });

  useEffect(() => {
    getOrder();
  }, []);

  async function getOrder() {
    let id = new URLSearchParams(window.location.search).get("id");

    let res = (await getDoc(doc(db, "orders", id))).data();
    setOrder(res);
  }

  const payEscrow = async (token, tokenName) => {
    let o = order;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let m = await provider.send("eth_requestAccounts", []);
      m = m[0];

      const signer = await provider.getSigner();

      const ctToken = new ethers.Contract(token, usdtAbi, signer);

      try {
        if ((await ctToken.allowance(m, vendswap)) < usdtAMOUNT) {
          toast.info("Approving the USDT");
          let tx = await ctToken.approve(vendswap, usdtAMOUNT);
          let req = await tx.wait();
        }
      } catch (e) {
        toast.error("Failed");
        console.log(e);
        return;
      }

      if (!ethers.utils.isAddress(o["Buyer Wallet"])) {
        toast.error("Buyer Wallet address not found or invalid");
        return;
      }
      if (!ethers.utils.isAddress(o["Seller Wallet"])) {
        toast.error("Seller Wallet address not found or invalid");
        return;
      }

      const ct = new ethers.Contract(vendswap, vendswapAbi, signer);
      console.log({
        id: o.id,
        buyerEmail: o["Buyer Email"],
        sellerEmail: o.seller,
        buyerWallet: o["Buyer Wallet"],
        sellerWallet: o["Seller Wallet"],
        amount: String(usdtAMOUNT),
        buyerAmount: 0,
        sellerAmount: 0,
        numberofDevices: o["How many devices are you transferring?"],
        buyerClaimed: false,
        sellerClaimed: false,
        tokenAddress: token,
      });
      try {
        toast.info("Confirming transaction");
        let tx = await ct.createOrder({
          id: o.id,
          buyerEmail: o["Buyer Email"],
          sellerEmail: o.seller,
          buyerWallet: o["Buyer Wallet"],
          sellerWallet: o["Seller Wallet"],
          amount: String(usdtAMOUNT),
          buyerAmount: 0,
          sellerAmount: 0,
          numberofDevices: o["How many devices are you transferring?"],
          buyerClaimed: false,
          sellerClaimed: false,
          tokenAddress: token,
        });

        let req = await tx.wait().then(async (receipt) => {
          o.progress.stages["Escrow Paid"] = new Date(
            Date.now()
          ).toLocaleString();
          o.progress.status += 15;
          await updateDoc(doc(db, "orders", String(o.id)), {
            ...o,
            "Escrow Amount": (usdtAMOUNT / 100) * 95,
            "Platform Fee": (usdtAMOUNT / 100) * 5,
            "Escrow Tx": receipt.transactionHash,
            "Escrow Paid": "Yes",
            "Escrow Token Name": tokenName,
            "Escrow Token Address": token,
          }).then(() => {
            setModal(false);
            navigate("/dashboard/swap");
          });
        });
      } catch (e) {
        toast.error("Failed");
        console.log(e);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
  };

  const buyerClaimEscrow = async () => {
    let o = order;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let m = await provider.send("eth_requestAccounts", []);
      m = m[0];

      const signer = await provider.getSigner();

      console.log(o["Buyer Amount"].toString());

      const ct = new ethers.Contract(vendswap, vendswapAbi, signer);
      try {
        toast.info("Confirming transaction");
        let tx = await ct.buyerClaim(
          o.id,
          o.signature,
          o["Buyer Amount"].toString(),
          o["Seller Amount"].toString()
        );

        let req = await tx.wait().then(async (receipt) => {
          console.log(receipt);
          o.progress.stages["Buyer Claimed Escrow"] = new Date(
            Date.now()
          ).toLocaleString();
          o.progress.status += 15;
          await updateDoc(doc(db, "orders", String(o.id)), o).then(() =>
            navigate("/dashboard/swap-details?id=" + o.id)
          );
        });
      } catch (e) {
        toast.error("Failed");
        console.log(e);
      }
    } catch (e) {
      console.log(e);
      toast.error("Metamask not found");
    }
  };

  const sellerClaimEscrow = async () => {
    let o = order;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let m = await provider.send("eth_requestAccounts", []);
      m = m[0];

      const signer = await provider.getSigner();

      const ct = new ethers.Contract(vendswap, vendswapAbi, signer);
      try {
        toast.info("Confirming transaction");
        let tx = await ct.sellerClaim(
          o.id,
          o.signature,
          o["Buyer Amount"].toString(),
          o["Seller Amount"].toString()
        );

        let req = await tx.wait().then(async (receipt) => {
          console.log(receipt);
          o.progress.stages["Seller Withdrawn Escrow"] = new Date(
            Date.now()
          ).toLocaleString();
          o.progress.status += 15;
          await updateDoc(doc(db, "orders", String(o.id)), o).then(() =>
            navigate("/dashboard/swap-details?id=" + o.id)
          );
        });
      } catch (e) {
        toast.error("Failed");
        console.log(e);
      }
    } catch (e) {
      console.log(e);
      toast.error("Metamask not found");
    }
  };

  return (
    <>
      <Card className="mx-3 mt-8 mb-6 lg:mx-4">
        <CardBody className="p-4">
          <Typography variant="h6" color="blue-gray">
            Order# {order.id}
          </Typography>
          <div className="mt-3 mb-12 grid grid-cols-12 px-4">
            <div className="col-span-8 grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Progress:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.status}%
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Order Created:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Order Created"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Are you able to provide the Swap escrow?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Are you able to provide the Swap escrow?"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  How many devices are you transferring?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["How many devices are you transferring?"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  What's your monthly revenue per device?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  ${order["What's your monthly revenue per device?"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Are you able to provide the Swap escrow?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Are you able to provide the Swap escrow?"]}
                </Typography>
              </div>

              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Escrow Paid at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Escrow Paid"]}
                </Typography>
              </div>

              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Seller Withdrawn Escrow at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Seller Withdrawn Escrow"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Admin Confirmation at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Admin Confirmation"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Buyer Claimed Escrow at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Buyer Claimed Escrow"]}
                </Typography>
              </div>

              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Buyer Wallet:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  <a
                    className="font-semibold underline"
                    target="_blank"
                    href={
                      "https://etherscan.io/address/" + order["Buyer Wallet"]
                    }
                  >
                    {order["Buyer Wallet"].substring(0, 6)}....
                    {order["Buyer Wallet"].substring(
                      order["Buyer Wallet"].length - 6,
                      order["Buyer Wallet"].length
                    )}
                  </a>
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Do you have a current escrow provider?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Do you have a current escrow provider?"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Buyer Email:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Buyer Email"]}
                </Typography>
              </div>

              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Seller:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["seller"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Seller Wallet:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  <a
                    className="font-semibold underline"
                    target="_blank"
                    href={
                      "https://etherscan.io/address/" + order["Seller Wallet"]
                    }
                  >
                    {order["Seller Wallet"].substring(0, 6)}....
                    {order["Seller Wallet"].substring(
                      order["Seller Wallet"].length - 6,
                      order["Seller Wallet"].length
                    )}
                  </a>
                </Typography>
              </div>

              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Are you using Cantaloupe or Nayax or other?
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Are you using Cantaloupe or Nayax or other?"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Pos Account Number:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Pos Account Number"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Escrow Paid:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Escrow Paid"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Escrow Tx:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  <a
                    className="font-semibold underline"
                    href={"https://etherscan.io/tx/" + order["Escrow Tx"]}
                    target="_blank"
                  >
                    {order["Escrow Tx"].substring(0, 6)}....
                    {order["Escrow Tx"].substring(
                      order["Escrow Tx"].length - 6,
                      order["Escrow Tx"].length
                    )}
                  </a>
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Platform Fee:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  ${parseInt(order["Platform Fee"] / 1e6)}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Escrow Amount:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  ${parseInt(order["Escrow Amount"] / 1e6)}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Devices Serials Added by Seller at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Devices Serials Seller"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Devices Serials Added by Buyer at:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order.progress.stages["Devices Serials Buyer"]}
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Seller Amount:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Seller Amount"] / 1e6} USDT
                </Typography>
              </div>
              <div className="grid grid-cols-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Buyer Amount:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {order["Buyer Amount"] / 1e6} USDT
                </Typography>
              </div>
            </div>
            <div className="col-span-4">
              <CardBody className="pt-0">
                <Typography variant="h6" color="white" className="text-black">
                  Progress:
                </Typography>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <PlusCircleIcon className="!h-5 !w-5 text-green-600" />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Swap Created
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Order Created"]}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <QrCodeIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Devices Serials Seller"] ==
                        "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Device Serials from Seller
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Escrow Paid"] == "Incomplete" &&
                      user.uid == order.user &&
                      order.progress.status <= "25" ? (
                        <Button
                          variant="filled"
                          size="sm"
                          onClick={() => {
                            navigate(
                              "/dashboard/swap-confirmation?id=" + order.id
                            );
                          }}
                          className="block"
                        >
                          Input Device Serials
                        </Button>
                      ) : (
                        order.progress.stages["Devices Serials Seller"]
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <QrCodeIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Devices Serials Buyer"] ==
                        "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Device Serials from Buyer
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Devices Serials Buyer"] ==
                        "Incomplete" &&
                      user.email == order["Buyer Email"] &&
                      order.progress.status == "25" ? (
                        <Button
                          variant="filled"
                          size="sm"
                          onClick={() => {
                            navigate(
                              "/dashboard/swap-confirmation?id=" + order.id
                            );
                          }}
                          className="block"
                        >
                          Input Device Serials
                        </Button>
                      ) : (
                        order.progress.stages["Devices Serials Buyer"]
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <CurrencyDollarIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Escrow Paid"] == "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Escrow Paid by Seller
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Escrow Paid"] == "Incomplete" &&
                      user.uid == order.user &&
                      order.progress.status == "40" ? (
                        <>
                          <Button
                            variant="filled"
                            size="sm"
                            onClick={() => setModal(true)}
                            className="block"
                          >
                            PAY ESCROW
                          </Button>
                        </>
                      ) : (
                        order.progress.stages["Escrow Paid"]
                      )}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <UserCircleIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Admin Confirmation"] ==
                        "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Admin Confirmation
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Admin Confirmation"] ==
                        "Incomplete" &&
                      user.uid == "ADMIN" &&
                      order.progress.status == "55" ? (
                        <Button
                          variant="filled"
                          size="sm"
                          onClick={() => {
                            navigate(
                              "/dashboard/admin-confirmation?id=" + order.id
                            );
                          }}
                          className="block"
                        >
                          Admin Confirmation
                        </Button>
                      ) : (
                        order.progress.stages["Admin Confirmation"]
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-4/6 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <ArrowDownOnSquareStackIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Buyer Claimed Escrow"] ==
                        "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Buyer Claimed Escrow
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {order.progress.stages["Buyer Claimed Escrow"] ==
                        "Incomplete" &&
                      user.email == order["Buyer Email"] &&
                      order.progress.status >= "70" ? (
                        <Button
                          variant="filled"
                          size="sm"
                          onClick={() => {
                            buyerClaimEscrow();
                          }}
                          className="block"
                        >
                          Claim Escrow
                        </Button>
                      ) : (
                        <>
                          {order.progress.stages["Buyer Claimed Escrow"]}
                          {order["Buyer Claimed Escrow Amount"]}
                        </>
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3">
                  <div className="relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:h-0 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-['']">
                    <CircleStackIcon
                      className={`!h-5 !w-5 ${
                        order.progress.stages["Seller Withdrawn Escrow"] ==
                        "Incomplete"
                          ? "text-blue-gray-500"
                          : "text-green-600"
                      } `}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      Seller Withdrawn Escrow
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {/* {order.progress.stages["Seller Withdrawn Escrow"]} */}

                      {order.progress.stages["Seller Withdrawn Escrow"] ==
                        "Incomplete" &&
                      user.uid == order.user &&
                      order.progress.status >= "70" ? (
                        <Button
                          variant="filled"
                          size="sm"
                          onClick={() => sellerClaimEscrow()}
                          className="block"
                        >
                          Withdraw
                        </Button>
                      ) : (
                        order.progress.stages["Seller Withdrawn Escrow"]
                      )}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={modal} handler={setModal} className="p-4">
        <Typography variant="h6" color="blue-gray">
          Pay Escrow for Order# {order.id}
        </Typography>
        <Typography
          as="span"
          variant="small"
          className="my-2 text-sm font-normal text-blue-gray-500"
        >
          Pay escrow for{" "}
          <strong>{order["How many devices are you transferring?"]} </strong>
          devices. <br />
          You will not be able to change/add devices after this step.
        </Typography>
        <Button
          variant="filled"
          size="sm"
          onClick={() => {
            navigate("/dashboard/swap-confirmation?id=" + order.id);
          }}
          className="mx-1 my-2"
          color="green"
        >
          ADD MORE DEVICES
        </Button>
        <br />
        <Button
          variant="filled"
          size="sm"
          onClick={() => payEscrow(usdc, "USDC")}
          className="mx-1 my-2"
        >
          ESCROW $USDC
        </Button>

        <Button
          variant="filled"
          size="sm"
          onClick={() => payEscrow(usdt, "USDT")}
          className="mx-1 my-2"
        >
          ESCROW $USDT
        </Button>
      </Dialog>
    </>
  );
}

export default OrderDetails;

// for admin

// "Device Serial Numbers": (
//   <>
//     {order["Device Serial Numbers"] ? (
//       <ol>
//         {order["Device Serial Numbers"].map(
//           (value, index) => {
//             return (
//               <li>
//                 <Typography
//                   variant="small"
//                   className="font-normal text-blue-gray-500"
//                 >
//                   {value}
//                 </Typography>
//               </li>
//             );
//           }
//         )}
//       </ol>
//     ) : (
//       ""
//     )}
//   </>
// ),

// const signtest = async () => {
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   let m = await provider.send("eth_requestAccounts", []);
//   m = m[0];

//   const signer = provider.getSigner();

//   let message1 = ethers.utils.solidityPack(
//     ["string", "uint256", "uint256"],
//     ["2", 5, 15]
//   );

//   message1 = ethers.utils.solidityKeccak256(["bytes"], [message1]);
//   const signature1 = await signer.signMessage(
//     ethers.utils.arrayify(message1)
//   );
//   console.log(signature1);
// };
