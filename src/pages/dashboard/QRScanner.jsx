import { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import QrReader from "react-qr-scanner";

export const QRScanner = (props) => {
  function scan(r) {
    if (r && r.text) props.onResult(r.text);
  }

  return (
    <div className="relative">
      <div
        id="UIElement"
        className="max-w-screen fixed left-1/2 top-1/2 h-[500px] max-h-screen w-[500px] -translate-x-1/2 -translate-y-1/2"
      >
        <div id="div-ui-container">
          <div className="dce-video-container">
            <QrReader
              delay={100}
              style={{
                height: 400,
                width: 500,
              }}
              onError={(e) => alert(e)}
              onScan={(r) => scan(r)}
            />
            <XCircleIcon
              onClick={() => {
                props.onResult(props.value);
              }}
              className=" absolute left-1/2 bottom-0 w-10 -translate-x-1/2 cursor-pointer text-[#554d4d]"
            ></XCircleIcon>
          </div>
        </div>
      </div>
    </div>
  );
};
