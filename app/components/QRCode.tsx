// app/components-QRCode.tsx : QR Code للروابط
"use client";
import { useEffect, useRef } from "react";

export default function QRCode({ data, size = 128, className = "" }: { data: string; size?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);

    // Simple QR-like pattern for demo (real QR would need a library)
    // For production, use 'qrcode' npm package or similar
    ctx.fillStyle = "#000";
    const moduleSize = Math.floor(size / 25);
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        // Simple pattern based on data hash
        const hash = data.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
        const pseudo = (hash + x * 7 + y * 13) % 2;
        if (pseudo === 0) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add finder patterns (corners)
    const drawFinder = (cx: number, cy: number) => {
      ctx.fillStyle = "#000";
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (Math.abs(dx) === 3 || Math.abs(dy) === 3 || (Math.abs(dx) <= 1 && Math.abs(dy) <= 1)) {
            ctx.fillRect((cx + dx) * moduleSize, (cy + dy) * moduleSize, moduleSize, moduleSize);
          }
        }
      }
    };
    drawFinder(3, 3);
    drawFinder(21, 3);
    drawFinder(3, 21);
  }, [data, size]);

  return <canvas ref={canvasRef} width={size} height={size} className={className} style={{ imageRendering: "pixelated" }} />;
}