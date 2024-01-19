import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const Camera: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const webcamRef = React.useRef<Webcam>(null);

  const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints | boolean>({
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  });

  useEffect(() => {
    const updateVideoConstraints = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      setVideoConstraints({
        width: { ideal: screenWidth },
        height: { ideal: screenHeight },
        facingMode: 'user',
      });
    };

    // Panggil fungsi pertama kali untuk mengatur videoConstraints sesuai dengan ukuran layar saat ini
    updateVideoConstraints();

    // Tambahkan event listener untuk mengupdate videoConstraints saat ukuran layar berubah
    window.addEventListener('resize', updateVideoConstraints);

    // Cleanup event listener pada componentWillUnmount
    return () => {
      window.removeEventListener('resize', updateVideoConstraints);
    };
  }, []);

  const capture = async () => {
    const screenshot = webcamRef.current?.getScreenshot();

    if (screenshot) {
      const blob = await fetch(screenshot).then((res) => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.jpg');

      try {
        const response = await fetch('https://bigvision.id/ekyc', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('Response from API:', result);

      } catch (error) {
        console.error('Error sending image to API:', error);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white-500">
      {/* Webcam */}
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        ref={webcamRef}
        videoConstraints={videoConstraints}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Background */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('/bg-camera.png')`, backgroundSize: 'cover' }}
      ></div>

      {/* Tulisan "Face Login" */}
      <div className="absolute top-6 w-full text-white text-center sm:top-1/3 mt-8 sm:mt-12 lg:mt-16 xl:mt-20">
        <div className='text-lg sm:text-2xl lg:text-3xl xl:text-4xl'>Face Login</div>
        <div className='text-base sm:text-lg lg:text-xl xl:text-2xl'>Add face recognition into account</div>
      </div>

      {/* Tulisan "Please look Front a camera" */}
      <div className="absolute bottom-20 transform w-full text-white text-center">
        <div className='text-base sm:text-lg lg:text-xl xl:text-2xl'>Please look Front a camera</div>
      </div>


      {/* Tombol Ambil Foto */}
      <button
        onClick={capture}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white bg-gradient-to-l from-sky-950 to-cyan-800 rounded-[20px] shadow w-3/4 sm:w-1/2 lg:w-1/3 xl:w-1/4 h-[54px]"
      >
        Take Photo
      </button>

      {imageSrc && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          {/* Tampilkan gambar yang diambil */}
          <h2 className="text-white">Foto yang Diambil:</h2>
          <img src={imageSrc} alt="Captured" className="mt-2" />
        </div>
      )}
    </div>
  );
};

export default Camera;
