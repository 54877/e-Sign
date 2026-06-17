import { useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function App() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const clear = () => sigRef.current?.clear();

  const save = () => {
    if (!sigRef.current) return;

    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    console.log(dataUrl);
  };

  useEffect(() => {
    const canvas = sigRef.current?.getCanvas();
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ratio = window.devicePixelRatio || 1;

    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 20px)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          minWidth={1}
          maxWidth={3}
          throttle={8}
          canvasProps={{
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              border: "1px solid #ccc",
              touchAction: "none",
            },
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={clear}>清除</button>
        <button onClick={save}>儲存</button>
      </div>
    </div>
  );
}
