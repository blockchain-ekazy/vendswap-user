import { Card, CardBody, Button, Input } from "@material-tailwind/react";
import { QrCodeIcon, XCircleIcon } from "@heroicons/react/24/outline";

import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function OrderConfirmation() {
  const { user } = UserAuth();
  const navigate = useNavigate();

  const [size, setSize] = useState(0);
  const [order, setOrder] = useState({});
  const [inputs, setinputs] = useState([]);
  const [scanner, setscanner] = useState(<></>);
  const [sizeInput, setsizeInput] = useState(false);

  useEffect(() => {
    getOrder();
  }, []);

  async function getOrder() {
    let id = new URLSearchParams(window.location.search).get("id");

    let res = await getDoc(doc(db, "orders", id));
    setOrder(res.data());
    setSize(res.data()["How many devices are you transferring?"]);

    if (user.email == res.data().seller) {
      setsizeInput(true);
    }
  }

  useEffect(() => {
    generateInputs();
  }, [size]);

  async function generateInputs() {
    let inputs_ = [];
    for (let i = 0; i < size; i++) {
      inputs_.push(
        <div className={"input-" + i + " relative duration-1000"}>
          <Input
            type="number"
            label={"Enter Serial Number of Device #" + eval(i + 1)}
            size="lg"
            id={"input-" + i}
          />
          <QrCodeIcon
            onClick={() => scancode(i)}
            title="Scan Code"
            className="absolute top-3 right-10 h-1/2 cursor-pointer duration-300 hover:scale-125"
          ></QrCodeIcon>
        </div>
      );
    }

    setinputs(inputs_);
  }

  const saveSerials = async (e) => {
    e.preventDefault();

    let size_ = size;
    let values_ = [];
    for (let i = 0; i < size_; i++) {
      values_.push(e.target[i].value);
    }

    let o = { ...order };
    if (user.email == o.seller) {
      o.progress.stages["Devices Serials Seller"] = new Date(
        Date.now()
      ).toLocaleString();
      o["Devices Serials Seller"] = values_;
      o.progress.status = 25;
    } else if (user.email == o["Buyer Email"]) {
      o.progress.stages["Devices Serials Buyer"] = new Date(
        Date.now()
      ).toLocaleString();
      o["Devices Serials Buyer"] = values_;
      o.progress.status = 55;
    }
    o["How many devices are you transferring?"] = size_;
    try {
      await updateDoc(doc(db, "orders", String(o.id)), o).then(() =>
        navigate("/dashboard/swap-details?id=" + o.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const updateInput = (value, index) => {
    document.getElementById("input-" + index).value = value;

    document
      .getElementsByClassName("input-" + index)[0]
      .classList.add("bg-yellow-800/30");

    setTimeout(() => {
      document
        .getElementsByClassName("input-" + index)[0]
        .classList.remove("bg-yellow-800/30");
    }, 1000);
  };

  const scancode = (index) => {
    setscanner(
      <div className="fixed right-0 z-10 overflow-hidden rounded-3xl shadow-md">
        <XCircleIcon
          className="absolute right-0 top-0 w-10 cursor-pointer text-white"
          onClick={() => setscanner(<></>)}
        ></XCircleIcon>
        <BarcodeScannerComponent
          onUpdate={(err, result) => {
            if (result) {
              setscanner(<></>);
              updateInput(result.text, index);
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
          {sizeInput ? (
            <div className="my-4 block">
              <Input
                type="number"
                label="Number of Devices"
                size="lg"
                value={size}
                onChange={(e) => {
                  if (e.target.value >= 1) setSize(e.target.value);
                }}
              />
            </div>
          ) : (
            ""
          )}
          <form onSubmit={(e) => saveSerials(e)}>
            <div className="grid grid-cols-1 gap-4">
              {scanner}
              {inputs}
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
                  type="submit"
                  // onClick={async () => {
                  //   saveSerials();
                  // }}
                  className="mx-1"
                >
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}

export default OrderConfirmation;
