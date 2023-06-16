import { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

export const BScanner = (props) => {
  let pScanner = null;

  const [scannerState, setScannerState] = useState();

  const init = () => {
    (async () => {
      try {
        // await Dynamsoft.DBR.BarcodeScanner.loadWasm();
        showScanner();
      } catch (ex) {
        let errMsg;
        if (ex.message.includes("network connection error")) {
          errMsg =
            "Failed to connect to Dynamsoft License Server: network connection error. Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.";
        } else {
          errMsg = ex.message || ex;
        }
        console.error(errMsg);
        alert(errMsg);
      }
    })();
  };

  async function showScanner() {
    try {
      let scanner = await (pScanner =
        pScanner || Dynamsoft.DBR.BarcodeScanner.createInstance());

      setScannerState(scanner);

      scanner.onUniqueRead = async (txt, result) => {
        console.log(result);
        await scanner.hide();
        props.onResult(txt);
      };
      await scanner.setUIElement(document.getElementById("div-ui-container"));
      await scanner.show();
    } catch (ex) {
      let errMsg;
      if (ex.message.includes("network connection error")) {
        errMsg =
          "Failed to connect to Dynamsoft License Server: network connection error. Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.";
      } else {
        errMsg = ex.message || ex;
      }
      console.error(errMsg);
      alert(errMsg);
    }
  }

  function scannerHide() {
    scannerState.hide();
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="relative">
      {/* // onClick={() => setscanner(<></>)} */}
      <div
        id="UIElement"
        className="max-w-screen fixed left-1/2 top-1/2 h-[500px] max-h-screen w-[500px] -translate-x-1/2 -translate-y-1/2"
      >
        <div id="div-ui-container">
          <div className="dce-video-container">
            <XCircleIcon
              onClick={() => {
                scannerHide();
                props.onResult(props.value);
              }}
              className=" absolute right-0 top-1/2 w-10 cursor-pointer text-white"
            ></XCircleIcon>
          </div>
        </div>
      </div>
    </div>
  );
};
