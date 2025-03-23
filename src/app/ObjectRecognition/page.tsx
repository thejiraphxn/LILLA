"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";

export default function ObjectDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<{ label: string; confidence: number; box: number[] }[]>([]);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // เปิดกล้องด้วย aspect ratio 9:16
    navigator.mediaDevices
      .getUserMedia({ video: { aspectRatio: 9 / 16 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError("❌ Camera access denied!"));

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setLoading(true);
    setError(null);
    setObjects([]);
    setDescription(null);

    const ctx = canvas.getContext("2d");

    // กำหนดขนาดของภาพให้เป็น 9:16
    const width = video.videoWidth;
    const height = Math.floor((width * 16) / 9);
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(video, 0, 0, width, height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("⚠️ Failed to capture image.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      try {
        const res = await axios.post("http://127.0.0.1:5001/detect", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setObjects(res.data.objects);
        setDescription(res.data.description);
      } catch (error) {
        setError("❌ Failed to detect objects.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="h-full sm:h-screen p-4 bg-zinc-800 text-white">
      <div className="grid grid-cols-1 bg-zinc-800 pb-4 justify-items-center mb-10">
        <h3 className="text-white">
          LILLA Object-Recognition (Llama 3.2 Model)
        </h3>
      </div>

      <div className="md:py-3 md:px-5 md:flex md:max-w-full md:w-full sm:grid sm:grid-cols-1 sm:py-3 xs:px-7">
        <div className="md:w-2/5 justify-items-center">
            <div className="relative w-full max-w-xs">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="border border-zinc-600 rounded-lg shadow-lg w-full aspect-[9/16]"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>

          <div className="md:w-3/5 justify-items-center">
            <div className="max-w-xs sm:max-w-full">
              <button
                onClick={captureImage}
                className="mt-4 lg:mt-0 cursor-pointer w-full bg-zinc-600 text-white px-5 py-3 cursor-pointer rounded-xl hover:bg-zinc-700 transition ease-in-out duration-200"
                disabled={loading}
              >
                {loading ? "Processing..." : "Detect Objects"}
              </button>

              {error && <p className="mt-4 text-red-500">{error}</p>}

              {objects.length > 0 && (
                <div className="mt-6 bg-zinc-700 p-4 rounded-lg shadow-lg w-full">
                  <h2 className="text-lg font-semibold mb-2">Detected Objects</h2>
                  <ul className="list-disc ml-4">
                    {objects.map((obj, index) => (
                      <li key={index} className="text-white">
                        {obj.label} ({obj.confidence.toFixed(2)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {description && (
                <div className="mt-4 bg-zinc-700 p-4 rounded-lg shadow-lg w-full">
                  <h2 className="text-lg font-semibold">AI Description</h2>
                  <p className="text-gray-300 mt-2">{description}</p>
                </div>
              )}
            </div>
            </div>
        </div>
          
    </div>
  );
}
