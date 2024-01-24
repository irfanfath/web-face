// eslint-disable-next-line
import React, { useEffect, useRef, useState } from "react";
import { FaceDetector, FilesetResolver /*, Detection */ } from "@mediapipe/tasks-vision";

let faceDetector;
let vision;

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
const children = [];

export default function Face() {
    const webcamRef = useRef(null);
    const [imageCapture, setImageCapture] = useState('');

    const initializefaceDetector = async () => {
        vision = await FilesetResolver.forVisionTasks(
            "../../node_modules/@mediapipe/tasks-vision/wasm"
        );
        // vision = await FilesetResolver.forVisionTasks('../../node_modules/@mediapipe/tasks-vision/wasm'
        // );
        // faceDetector = await FaceDetector.createFromModelPath(vision, "/lib/blaze_face_short_range.tflite");
        faceDetector = await FaceDetector.createFromModelPath(vision,'../../public/lib/blaze_face_short_range.tflite');
    };

    useEffect(() => {
        initializefaceDetector();
    }, []);

    const handleLiveDetection = async () => {
        if (!faceDetector) {
            alert("Face Detector is still loading. Please try again..");
            return;
        }

        if (!hasGetUserMedia()) {
            console.log(navigator);
            alert("getUserMedia() is not supported by your browser");
            return;
        }

        await faceDetector.setOptions({ runningMode: "VIDEO" });

        try {
            const cameraLabel = 'HD UVC WebCam';
            const devices = await window?.navigator?.mediaDevices?.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            const selectedCamera = cameras.filter((camera) => camera.label.includes(cameraLabel));

            const constraints = {
                video: {
                    deviceId: selectedCamera.length > 0 ? selectedCamera[0].deviceId : undefined,
                    height: 720,
                    width: 500,
                    frameRate: {
                        min: 30,
                    }
                }
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    webcamRef.current.srcObject = stream;
                    webcamRef.current.addEventListener("loadeddata", predictWebcam);
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };

    let lastVideoTime = -1;

    async function predictWebcam() {
        let startTimeMs = performance.now();

        if (webcamRef.current?.currentTime !== lastVideoTime) {
            lastVideoTime = webcamRef.current.currentTime;
            const detections = faceDetector.detectForVideo(webcamRef.current, startTimeMs).detections;
            displayVideoDetections(detections, webcamRef.current);
        }

        window.requestAnimationFrame(predictWebcam);
    }

    function displayVideoDetections(detections, video) {
        const liveView = document.getElementById("liveView");

        for (let child of children) {
            liveView.removeChild(child);
        }
        children.splice(0);

        for (let detection of detections) {
            const p = document.createElement("p");
            p.innerText = "Confidence: " + Math.round(parseFloat(detection.categories[0].score) * 100) + "% .";
            p.setAttribute('style',
                "left: " + (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
                "top: " + (detection.boundingBox.originY - 30) + "px;" +
                "width: " + (detection.boundingBox.width - 10) + "px;"
            );

            const highlighter = document.createElement("div");
            highlighter.setAttribute("class", "highlighter");
            highlighter.setAttribute('style',
                "left: " + (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
                "top: " + detection.boundingBox.originY + "px;" +
                "width: " + (detection.boundingBox.width - 10) + "px;" +
                "height: " + detection.boundingBox.height + "px;"
            );

            liveView.appendChild(highlighter);
            liveView.appendChild(p);

            children.push(highlighter);
            children.push(p);

            for (let keypoint of detection.keypoints) {
                const keypointEl = document.createElement("span");
                keypointEl.className = "key-point";
                keypointEl.style.top = `${keypoint.y * video.offsetHeight - 3}px`;
                keypointEl.style.left = `${video.offsetWidth - keypoint.x * video.offsetWidth - 3}px`;
                liveView.appendChild(keypointEl);
                children.push(keypointEl);
            }
        }
    }

    const capture = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 720;

        try {
            canvas.getContext('2d').drawImage(webcamRef.current, 0, 0, webcamRef.current.videoWidth, webcamRef.current.videoHeight);
            let image_data_url = canvas.toDataURL('image/jpeg');

            console.log(image_data_url);
            setImageCapture(image_data_url);
        } catch (err) {
            console.error("Error: " + err);
        }
    };

    return (
        <>
            <div className='p-5'>
                <h1>Face detection using the MediaPipe Face Detector task</h1>

                <section>
                    <h2>Demo: Webcam continuous face detection</h2>
                    <p>Detect faces from your webcam. When ready click "enable webcam" below and accept access to the webcam.</p>
                    <button className="bg-indigo-500 rounded-2xl px-5 py-3 text-white" onClick={handleLiveDetection} title="Click to live face detection">ENABLE WEBCAM</button>
                    <div className="flex justify-center items-center">
                        <div id="liveView" className="mt-10 relative overflow-hidden bg-gray-300 shadow-lg rounded-2xl">
                            <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl z-10" style={{ background: '-webkit-radial-gradient(transparent 120px, rgba(0,0,0,0.5) 0px)' }}></div>
                            <video ref={webcamRef} id="webcam" autoPlay playsInline></video>
                        </div>
                    </div>
                    <button className="bg-indigo-500 rounded-2xl px-5 py-3 text-white" onClick={capture} title="Click to live face detection">Capture</button>
                    {imageCapture &&
                        <img alt="" src={imageCapture} />
                    }
                </section>
            </div>
        </>
    );
}
