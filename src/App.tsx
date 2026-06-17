import { useCallback, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function App() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // 保存筆跡資料
  const signatureDataRef = useRef<ReturnType<SignatureCanvas["toData"]> | null>(
    null,
  );

  const clear = () => {
    sigRef.current?.clear();
    signatureDataRef.current = null;
  };

  const save = () => {
    if (!sigRef.current) return;

    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    console.log(dataUrl);
  };

  const resizeCanvas = useCallback(() => {
    const canvas = sigRef.current?.getCanvas();
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    // 先保存目前筆跡
    signatureDataRef.current = sigRef.current?.toData() ?? null;

    const ratio = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    // ⭐ 恢復筆跡
    if (signatureDataRef.current && signatureDataRef.current.length > 0) {
      sigRef.current?.fromData(signatureDataRef.current);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();

    let timer: number;

    const handleResize = () => {
      clearTimeout(timer);

      timer = window.setTimeout(() => {
        resizeCanvas();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [resizeCanvas]);

  return (
    <div
      style={{
        height: "95dvh",
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
          clearOnResize={false}
          penColor="black"
          minWidth={1}
          maxWidth={3}
          throttle={8}
          onEnd={() => {
            signatureDataRef.current = sigRef.current?.toData() ?? null;
          }}
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
