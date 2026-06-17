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

  const stateRef = useRef<SignatureState | null>(null);

  const clear = () => {
    sigRef.current?.clear();
    stateRef.current = null;
  };

  const save = () => {
    if (!sigRef.current) return;

    const url = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    console.log(url);
  };

  /**
   * ⭐ 存原始 data + 當下尺寸
   */
  const capture = () => {
    const sig = sigRef.current;
    const wrapper = wrapperRef.current;

    if (!sig || !wrapper) return;

    stateRef.current = {
      data: sig.toData(),
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
    };
  };

  /**
   * ⭐ scale + redraw（核心）
   */
  const redrawWithScale = useCallback(() => {
    const canvas = sigRef.current?.getCanvas();
    const wrapper = wrapperRef.current;
    const state = stateRef.current;

    if (!canvas || !wrapper || !state) return;

    const newW = wrapper.clientWidth;
    const newH = wrapper.clientHeight;

    const scaleX = newW / state.width;
    const scaleY = newH / state.height;

    const ratio = window.devicePixelRatio || 1;

    canvas.width = newW * ratio;
    canvas.height = newH * ratio;

    canvas.style.width = `${newW}px`;
    canvas.style.height = `${newH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.scale(ratio, ratio);

    sigRef.current?.clear();

    requestAnimationFrame(() => {
      sigRef.current?.fromData(state.data);
    });
  }, []);

  /**
   * ⭐ init + resize listener
   */
  useEffect(() => {
    redrawWithScale();

    let timer: number;

    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(redrawWithScale, 100);
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [redrawWithScale]);

  return (
    <div style={{ height: "95dvh", display: "flex", flexDirection: "column" }}>
      <div ref={wrapperRef} style={{ flex: 1, minHeight: 0 }}>
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          minWidth={1}
          maxWidth={3}
          throttle={8}
          clearOnResize={false}
          onEnd={capture}
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
