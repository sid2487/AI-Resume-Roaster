"use client";

import { useRef, useState } from "react";

export default function RoastGenerator() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [temperature, setTemperature] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setLoading(true);
    setRoast("");

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await fetch(
        "/api/fileupload",
        {
          method: "POST",
          body: formData,
          headers: {
            "x-temperature": temperature.toString(),
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setRoast(errData?.error || "Server error");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setRoast(data.roast);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      setRoast("Error: Could not generate roast.");
    }
    setLoading(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(roast);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">
        AI Roast My Resume
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg space-y-5"
      >
        
        <input
          ref={fileInputRef}
          type="file"
          className="w-full bg-gray-700 p-3 rounded-lg cursor-pointer"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
        />

       
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setTemperature(Math.max(0, temperature - 0.1))}
            className="px-3 py-1 bg-gray-700 rounded-lg"
          >
            -(dec temp)
          </button>

          <span className="text-xl">{temperature.toFixed(1)}</span>

          <button
            type="button"
            onClick={() => setTemperature(Math.min(2, temperature + 0.1))}
            className="px-3 py-1 bg-gray-700 rounded-lg"
          >
            +(inc temp)
          </button>
        </div>

        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg text-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Roasting..." : "Roast My Resume"}
        </button>
      </form>

     
      {roast && (
        <div className="mt-8 w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg relative">
          <h2 className="text-2xl font-bold mb-3 text-pink-400">
            Your Roast 
          </h2>

          <p className="whitespace-pre-wrap leading-relaxed">{roast}</p>

          <button
            onClick={copyText}
            className="absolute top-4 right-4 bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
