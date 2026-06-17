import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function App() {
  const sigRef = useRef<SignatureCanvas>(null);
  const secSigRef = useRef<SignatureCanvas>(null);
  // 清除簽名

  const clear = (ref: React.RefObject<SignatureCanvas | null>) => {
    ref.current?.clear();
  };
  // 取得簽名（base64圖片）
  const save = () => {
    if (!sigRef.current) return;

    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    console.log(dataUrl); // 👉 可送後端 or 顯示圖片
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "sigCanvas",
          style: { border: "1px solid #ccc" },
        }}
        minWidth={1}
        maxWidth={3}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => clear(sigRef)}>清除</button>
        <button onClick={save}>儲存</button>
      </div>

      <SignatureCanvas
        ref={secSigRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "sigCanvas",
          style: { border: "1px solid #ccc" },
        }}
        minWidth={1}
        maxWidth={3}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => clear(secSigRef)}>清除</button>
        <button onClick={save}>儲存</button>
      </div>
    </div>
  );
}
