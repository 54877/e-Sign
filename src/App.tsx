import { useCallback, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type SignaturePad = InstanceType<typeof SignatureCanvas>;
type SignatureData = ReturnType<SignaturePad["toData"]>;

type SignatureCache = {
  data: SignatureData | null;
  width: number;
  height: number;
};

export default function App() {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const portraitCacheRef = useRef<SignatureCache>({
    data: null,
    width: 0,
    height: 0,
  });

  const landscapeCacheRef = useRef<SignatureCache>({
    data: null,
    width: 0,
    height: 0,
  });

  const portraitDirtyRef = useRef(false);
  const landscapeDirtyRef = useRef(false);

  const sizeRef = useRef({ width: 0, height: 0 });

  const isPortrait = (w: number, h: number) => h >= w;

  const clear = () => {
    sigRef.current?.clear();

    portraitCacheRef.current = { data: null, width: 0, height: 0 };
    landscapeCacheRef.current = { data: null, width: 0, height: 0 };

    portraitDirtyRef.current = false;
    landscapeDirtyRef.current = false;
  };

  const save = () => {
    const sig = sigRef.current;
    if (!sig) return;

    console.log(sig.getTrimmedCanvas().toDataURL("image/png"));
  };

  const scaleSignature = (
    data: SignatureData,
    scaleX: number,
    scaleY: number,
  ): SignatureData => {
    return data.map((stroke) =>
      stroke.map((p) => {
        p.x *= scaleX;
        p.y *= scaleY;
        return p;
      }),
    );
  };

  const draw = (sig: SignatureCanvas, data: SignatureData) => {
    requestAnimationFrame(() => {
      sig.clear();
      sig.fromData(data);
    });
  };

  const capture = () => {
    const sig = sigRef.current;
    if (!sig) return;

    const canvas = sig.getCanvas();
    const data = sig.toData();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const cache: SignatureCache = {
      data,
      width: w,
      height: h,
    };

    if (isPortrait(w, h)) {
      portraitCacheRef.current = cache;
      landscapeDirtyRef.current = true;
    } else {
      landscapeCacheRef.current = cache;
      portraitDirtyRef.current = true;
    }
  };

  const buildFromOtherSide = (
    source: SignatureCache,
    targetW: number,
    targetH: number,
  ): SignatureCache | null => {
    if (!source.data) return null;

    const scaleX = source.width ? targetW / source.width : 1;
    const scaleY = source.height ? targetH / source.height : 1;

    const cloned = structuredClone(source.data) as SignatureData;

    const scaled = scaleSignature(cloned, scaleX, scaleY);

    return {
      data: scaled,
      width: targetW,
      height: targetH,
    };
  };

  const resizeCanvas = useCallback(() => {
    const sig = sigRef.current;
    const wrapper = wrapperRef.current;

    if (!sig || !wrapper) return;

    const canvas = sig.getCanvas();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newW = wrapper.clientWidth;
    const newH = wrapper.clientHeight;

    const ratio = window.devicePixelRatio || 1;

    const portrait = isPortrait(newW, newH);

    sizeRef.current = { width: newW, height: newH };

    canvas.width = newW * ratio;
    canvas.height = newH * ratio;

    canvas.style.width = `${newW}px`;
    canvas.style.height = `${newH}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    if (portrait) {
      const cache = portraitCacheRef.current;

      if (cache.data && !portraitDirtyRef.current) {
        draw(sig, cache.data);
        return;
      }

      const built = buildFromOtherSide(landscapeCacheRef.current, newW, newH);

      if (built) {
        portraitCacheRef.current = built;
        portraitDirtyRef.current = false;
        draw(sig, built.data!);
      }

      return;
    }

    const cache = landscapeCacheRef.current;

    if (cache.data && !landscapeDirtyRef.current) {
      draw(sig, cache.data);
      return;
    }

    const built = buildFromOtherSide(portraitCacheRef.current, newW, newH);

    if (built) {
      landscapeCacheRef.current = built;
      landscapeDirtyRef.current = false;
      draw(sig, built.data!);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();

    let timer: number;

    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        resizeCanvas();
      }, 100);
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [resizeCanvas]);

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
