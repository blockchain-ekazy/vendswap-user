import { useEffect, useRef, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";
import { toast } from "react-toastify";

export const BScanner = ({ onResult, value }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    toast.info("Loading");

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;
        Dynamsoft.DBR.BarcodeReader.createInstance()
          .then((barcodeReaderInstance) => {
            barcodeReaderInstance.singleFrameMode = true;
            return barcodeReaderInstance.decode(imageData);
          })
          .then((results) => {
            console.log(results);
            if (results.length > 0) {
              onResult(results[0].barcodeText);
              setError(null);
            } else {
              setError("No barcode found in the image.");
              toast.error("No barcode found in the image.");
            }
          })
          .catch((error) => {
            console.error(error);
            setError("An error occurred while reading the barcode.");
            toast.error("An error occurred while reading the barcode.");
          });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <div
        id="UIElement"
        className="max-w-screen fixed left-1/2 top-1/3 h-auto max-h-screen w-auto -translate-x-1/2 -translate-y-1/2 rounded border-[1px] border-black/10 bg-white shadow-xl"
      >
        <XCircleIcon
          onClick={() => {
            onResult(value);
          }}
          className="ml-auto  mb-3 w-10 cursor-pointer text-[#554d4d]"
        ></XCircleIcon>
        <div className="p-3">
          <Button variant="filled" size="md" type="button" className="mx-1">
            <label className="bg-">
              Select an Image with Barcode OR QRcode
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </Button>
          {error && <p className="text-center text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
};
