
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'https://esm.sh/html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [useCamera, setUseCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  const startScanning = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(regionId);
    }

    const config = { fps: 15, qrbox: { width: 250, height: 250 } };

    try {
      setCameraError(null);
      
      // Attempt to find the back camera explicitly from the device list
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Look for a camera with "back" or "rear" in the label
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );

        // If found, use that specific device ID, otherwise fall back to facingMode: environment
        const cameraIdOrConfig = backCamera ? backCamera.id : { facingMode: "environment" };

        await scannerRef.current.start(
          cameraIdOrConfig,
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            if ('vibrate' in navigator) navigator.vibrate(100);
          },
          onScanError
        );
      } else {
        // No labels found, just try environment mode directly
        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            if ('vibrate' in navigator) navigator.vibrate(100);
          },
          onScanError
        );
      }
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      
      // Final fallback: try any camera
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await scannerRef.current!.start(
            devices[devices.length - 1].id, // Try the last one, often back on many phones
            config,
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            onScanError
          );
        } else {
          throw new Error("No cameras found on device.");
        }
      } catch (retryErr: any) {
        setCameraError(retryErr.message || "Could not access back camera.");
        setUseCamera(false);
      }
    }
  };

  useEffect(() => {
    if (useCamera) {
      startScanning();
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.debug("Stop error:", err));
        }
      }
    };
  }, [useCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode(regionId);
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        onScanSuccess(decodedText);
      })
      .catch(err => {
        alert("Could not find a valid QR code in this image.");
        console.error(err);
      });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {useCamera ? (
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner border border-white/5">
          <div id={regionId} className="w-full h-full"></div>
          {/* Overlay scanning animation */}
          <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/20 m-12 rounded-lg">
             <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_cyan] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      ) : (
        <div className="p-10 border-2 border-dashed border-zinc-700 rounded-3xl w-full text-center bg-zinc-900/50">
          <div className="mb-4 text-zinc-400">
            {cameraError ? (
              <p className="text-red-400 font-medium mb-2">{cameraError}</p>
            ) : (
              <p>Back camera not available.</p>
            )}
            <p className="text-sm">Please upload an image containing a QR code instead.</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="qr-file-upload"
          />
          <label
            htmlFor="qr-file-upload"
            className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-lg"
          >
            Upload QR Image
          </label>
        </div>
      )}
      
      <div className="mt-6 flex gap-6">
        <button 
          onClick={() => setUseCamera(!useCamera)}
          className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${useCamera ? 'bg-cyan-500' : 'bg-zinc-700'}`}></span>
          {useCamera ? "Switch to File Upload" : "Try Camera Again"}
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
        }
        #qr-reader-region video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};
