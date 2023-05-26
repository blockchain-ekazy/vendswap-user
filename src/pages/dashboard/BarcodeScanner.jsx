import { useState } from "react";
import { useZxing } from "react-zxing";

export const BarcodeScanner = (props) => {
  const { ref } = useZxing({
    onResult(result) {
      props.onResult(result.text);
    },
  });

  return (
    <>
      <video ref={ref} />
    </>
  );
};
