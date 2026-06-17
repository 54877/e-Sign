import { useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function App() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const secSigRef = useRef<SignatureCanvas | null>(null);

  // 清除
  const clear = (ref: React.RefObject<SignatureCanvas | null>) => {
    ref.current?.clear();
  };

  // 儲存
  const save = () => {
    if (!sigRef.current) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    console.log(dataUrl); // 👉 可送後端 or 顯示圖片
  };

  // 修正手機頓感（DPI + RWD）
  const fixCanvas = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const fix = (ref: React.RefObject<SignatureCanvas | null>) => {
      const canvas = ref.current?.getCanvas();
      if (!canvas) return;

      const width = canvas.offsetWidth || 500;
      const height = canvas.offsetHeight || 200;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);
    };

    fix(sigRef);
    fix(secSigRef);
  };

  useEffect(() => {
    fixCanvas();

    window.addEventListener("resize", fixCanvas);
    return () => window.removeEventListener("resize", fixCanvas);
  }, []);

  return (
    <div style={{ maxWidth: 600 }}>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        minWidth={1}
        maxWidth={3}
        throttle={8}
        canvasProps={{
          className: "sigCanvas",
          style: {
            width: "100%",
            height: 200,
            border: "1px solid #ccc",
            touchAction: "none",
          },
        }}
      />
      <button style={{ marginRight: "16px" }} onClick={() => clear(sigRef)}>
        清除
      </button>
      <button onClick={save}>儲存</button>

      <SignatureCanvas
        ref={secSigRef}
        penColor="black"
        minWidth={1}
        maxWidth={3}
        throttle={8}
        canvasProps={{
          className: "sigCanvas",
          style: {
            width: "100%",
            height: 200,
            border: "1px solid #ccc",
            marginTop: 20,
            touchAction: "none",
          },
        }}
      />

      <button style={{ marginRight: "16px" }} onClick={() => clear(secSigRef)}>
        清除
      </button>
      <button onClick={save}>儲存</button>
    </div>
  );
}
