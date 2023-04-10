import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Option,
  Typography,
  Radio,
} from "@material-tailwind/react";

import { QrCodeIcon, XCircleIcon } from "@heroicons/react/24/outline";

import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useNavigate } from "react-router-dom";
import { ProfileInfoCard } from "@/widgets/cards";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { ethers } from "ethers";

import { toast } from "react-toastify";
import { usdt, usdtAMOUNT, vendswap } from "@/blockchain/config";
import vendswapAbi from "@/blockchain/vendswap.abi.json";
import usdtAbi from "@/blockchain/usdt.abi.json";

export function OrderConfirmation() {
  const { user } = UserAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState({});
  const [inputs, setinputs] = useState([]);
  const [scanner, setscanner] = useState(<></>);

  useEffect(() => {
    getOrder();
  }, []);

  async function getOrder() {
    let id = new URLSearchParams(window.location.search).get("id");

    let res = await getDoc(doc(db, "orders", id));
    setOrder(res.data());

    let size = res.data()["How many devices are you transferring?"];

    if (res.data()["Device Serial Numbers"] == undefined) {
      let a = new Array(Number(size)).fill("");
      setinputs(a);
    } else setinputs(res.data()["Device Serial Numbers"]);
  }

  const saveSerials = async () => {
    let o = { ...order };
    if (user.email == o.seller) {
      o.progress.stages["Devices Serials Seller"] = new Date(
        Date.now()
      ).toLocaleString();
      o["Devices Serials Seller"] = inputs;
    } else if (user.email == o["Buyer Email"]) {
      o.progress.stages["Devices Serials Buyer"] = new Date(
        Date.now()
      ).toLocaleString();
      o["Devices Serials Buyer"] = inputs;
    }
    o.progress.status += 15;
    try {
      await updateDoc(doc(db, "orders", String(o.id)), o).then(() =>
        navigate("/dashboard/swap-details?id=" + o.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const updateInput = (value, index) => {
    let a = [...inputs];
    a[index] = value;
    setinputs(a);
  };

  const scancode = (index) => {
    console.log(index);
    setscanner(
      <div className="fixed right-0 z-10 overflow-hidden rounded-3xl shadow-md">
        <XCircleIcon
          className="absolute right-0 top-0 w-10 cursor-pointer text-white"
          onClick={() => setscanner(<></>)}
        ></XCircleIcon>
        <BarcodeScannerComponent
          onUpdate={(err, result) => {
            if (result) {
              updateInput(result.text, index);
              setscanner(<></>);
              document
                .getElementsByClassName("input" + index)[0]
                .classList.add("bg-yellow-800/30");

              setTimeout(() => {
                document
                  .getElementsByClassName("input" + index)[0]
                  .classList.remove("bg-yellow-800/30");
              }, 1000);
            }
          }}
        />
      </div>
    );
  };

  return (
    <>
      <Card className="mx-3 mt-8 mb-6 lg:mx-4">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 gap-4">
            {scanner}

            {inputs.map((input, i) => {
              return (
                <div className={"input" + i + " relative duration-1000"}>
                  <Input
                    type="number"
                    label={"Enter Serial Number of Device #" + eval(i + 1)}
                    size="lg"
                    value={input}
                    onChange={(e) => updateInput(e.target.value, i)}
                  />
                  <QrCodeIcon
                    onClick={() => scancode(i)}
                    title="Scan Code"
                    className="absolute top-3 right-10 h-1/2 cursor-pointer duration-300 hover:scale-125"
                  ></QrCodeIcon>
                </div>
              );
            })}

            <div>
              <Button
                variant="outlined"
                size="md"
                onClick={() => navigate("/dashboard/swap")}
                className="mx-1"
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="md"
                onClick={async () => {
                  saveSerials();
                }}
                className="mx-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default OrderConfirmation;
