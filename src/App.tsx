import { useCallback, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type SignatureData = ReturnType<SignatureCanvas["toData"]>;

type SignatureState = {
  data: SignatureData;
  width: number;
  height: number;
};

export default function App() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const signatureStateRef = useRef<SignatureState | null>(null);

  const clear = () => {
    sigRef.current?.clear();
    signatureStateRef.current = null;
  };

  const save = () => {
    if (!sigRef.current) return;

    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    console.log(dataUrl);
  };

  /**
   * ⭐ 保存簽名
   */
  const saveSignatureState = () => {
    const wrapper = wrapperRef.current;
    const sig = sigRef.current;

    if (!wrapper || !sig) return;

    signatureStateRef.current = {
      data: sig.toData(),
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
    };
  };

  /**
   * ⭐ resize + restore（修正版）
   */
  const resizeCanvas = useCallback(() => {
    const canvas = sigRef.current?.getCanvas();
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    const old = signatureStateRef.current;

    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    const ratio = window.devicePixelRatio || 1;

    // resize canvas
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ✅ 正確 reset（你剛剛錯在這）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    /**
     * ⭐ restore signature（關鍵修正）
     * 必須重新 sync signature pad state
     */
    if (old?.data?.length) {
      sigRef.current?.clear();

      // 等一個 frame 避免 internal state conflict
      requestAnimationFrame(() => {
        sigRef.current?.fromData(old.data);
      });
    }
  }, []);

  /**
   * ⭐ init + resize listener
   */
  useEffect(() => {
    resizeCanvas();

    let timer: number;

    const handleResize = () => {
      clearTimeout(timer);

      timer = window.setTimeout(() => {
        resizeCanvas();
      }, 150);
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
        gap: 16,
      }}
    >
      {/* canvas */}
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
          onEnd={saveSignatureState}
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

      {/* toolbar */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={clear}>清除</button>
        <button onClick={save}>儲存</button>
      </div>
    </div>
  );
}
