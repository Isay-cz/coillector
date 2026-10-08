"use client";

import { useCallback, useEffect, useRef } from "react";

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type JsQR = typeof import("jsqr").default;

declare global {
  interface Window {
    BarcodeDetector?: {
      new (opts: { formats: string[] }): Detector;
      getSupportedFormats: () => Promise<string[]>;
    };
  }
}

async function nativeDetector(): Promise<Detector | null> {
  try {
    if (!window.BarcodeDetector) return null;
    const formats = await window.BarcodeDetector.getSupportedFormats();
    return formats.includes("qr_code") ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
  } catch {
    return null;
  }
}

/**
 * Lector de QR con la cámara trasera: usa BarcodeDetector nativo cuando existe (Android/Chrome)
 * y jsQR como respaldo (iOS Safari y otros). Llama a `onResult` con cada texto leído.
 */
export function useQrScanner(onResult: (text: string) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);
  const cb = useRef(onResult);
  cb.current = onResult;

  const stop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw Object.assign(new Error("Cámara no disponible"), { name: "NotFoundError" });
    }
    stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) throw new Error("Sin elemento de video");
    video.srcObject = stream;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    await video.play();

    let detector = await nativeDetector();
    let jsQR: JsQR | null = detector ? null : (await import("jsqr")).default;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    runningRef.current = true;

    const tick = async () => {
      if (!runningRef.current) return;
      try {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          let text: string | null = null;
          if (detector) {
            try {
              const codes = await detector.detect(video);
              text = codes[0]?.rawValue ?? null;
            } catch {
              // Si el detector nativo falla, seguimos con jsQR.
              detector = null;
              jsQR = (await import("jsqr")).default;
            }
          } else if (jsQR && ctx) {
            // Recorte cuadrado central, reducido a ≤ 640 px para que sea rápido en celulares.
            const side = Math.min(video.videoWidth, video.videoHeight);
            const size = Math.min(640, side);
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(video, (video.videoWidth - side) / 2, (video.videoHeight - side) / 2, side, side, 0, 0, size, size);
            const img = ctx.getImageData(0, 0, size, size);
            text = jsQR(img.data, size, size, { inversionAttempts: "dontInvert" })?.data ?? null;
          }
          if (text && runningRef.current) cb.current(text);
        }
      } finally {
        if (runningRef.current) timerRef.current = setTimeout(tick, 120);
      }
    };
    tick();
  }, [stop]);

  return { videoRef, start, stop };
}
