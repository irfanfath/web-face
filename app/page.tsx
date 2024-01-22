"use client";

import WasmFeatureDetectComponent from '@/utils/wasmFeatureDetection';
// import Camera from "./component/Camera";
// import PicoComponent from "./component/PicoComponent";

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between">
//       <div>
//         {/* <Camera /> */}
//         <PicoComponent />
//       </div>
//     </main>
//   )
// }

// pages/index.tsx
import { useEffect, useRef, useState } from 'react';

const IndexPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [shouldFaceUser, setShouldFaceUser] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const switchCamera = () => {
      if (stream !== null) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setShouldFaceUser((prev) => !prev);
      capture();
    };

    const capture = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            width: 640,
            height: 480,
            facingMode: shouldFaceUser ? 'user' : 'environment',
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    const ncnnScrfd = () => {
      WasmFeatureDetectComponent.threads().then((threadsSupported: any) => {
        if (threadsSupported) {
          // Lakukan sesuatu jika thread didukung
          // ...
        } else {
          // Lakukan sesuatu jika thread tidak didukung
          // ...
        }
      });
    };

    const sFilter = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          ncnnScrfd();
        }
      }

      requestAnimationFrame(sFilter);
    };

    switchCamera();
    requestAnimationFrame(sFilter);

    return () => {
      if (stream !== null) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [shouldFaceUser]);

  return (
    <div>
      <h1>ncnn webassembly scrfd oke</h1>
      <div>
        <button style={{ height: '48px' }}>
          Switch Camera
        </button>
      </div>
      <div>
        <canvas ref={canvasRef} width={640} height={480}></canvas>
      </div>
      <video ref={videoRef} playsInline autoPlay></video>
    </div>
  );
};

export default IndexPage;
