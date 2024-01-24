import React, { useEffect, useRef, useState } from "react";
import { FaceDetector, FilesetResolver, /* Detection */ } from "@mediapipe/tasks-vision";

let faceDetector: any;
let vision: any;

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
const children: any[] = [];

export default function TestFace() {
    const webcamRef = useRef<HTMLVideoElement>(null)
    const [imageCapture, setImageCapture] = useState('')

    const initializefaceDetector = async () => {
        vision = await FilesetResolver.forVisionTasks(
            // "../../node_modules/@mediapipe/tasks-vision/wasm"
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        faceDetector = await FaceDetector.createFromModelPath(vision,
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
            // '../../public/lib/blaze_face_short_range.tflite'
        );
        handleLiveDetection();
    }

    useEffect(() => {
        initializefaceDetector()
    }, [])


    const handleLiveDetection = async () => {
        if (!faceDetector) {
            alert("Face Detector is still loading. Please try again..");
            return;
        }

        if (!hasGetUserMedia()) {
            console.log(navigator)
            alert("getUserMedia() is not supported by your browser")
            return
        }

        // let video = document.getElementById("webcam") as HTMLVideoElement;
        await faceDetector.setOptions({ runningMode: "VIDEO" });

        try {
            // const cameraLabel = 'HD Webcam C525'
            const cameraLabel = 'HD UVC WebCam'
            const devices = await window?.navigator?.mediaDevices?.enumerateDevices()
            console.log(devices)
            const cameras = devices.filter((device) => device.kind === "videoinput")
            const selectedCamera = cameras.filter((camera) => camera.label.includes(cameraLabel))

            // console.log(selectedCamera[0])
            // getUsermedia parameters
            const constraints: MediaStreamConstraints = {
                video: {
                    // facingMode: { exact: 'user' },
                    deviceId: selectedCamera.length > 0 ? selectedCamera[0].deviceId : undefined,
                    height: 720, // REQUIRED VALUE: 480 720 1080
                    width: 500,
                    // width: { min: 640, ideal: 1920 },
                    // height: { min: 480, ideal: 1080 },
                    frameRate: {
                        min: 30,
                        // max: 120,
                    }
                }
            };

            // Activate the webcam stream.
            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    // console.log(stream)
                    webcamRef.current!.srcObject = stream
                    webcamRef.current!.addEventListener("loadeddata", predictWebcam)
                    // video.srcObject = stream;
                    // video.addEventListener("loadeddata", () => predictWebcam(video));
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (error) {
            alert(error)
            console.log(error)
        }
    }

    let lastVideoTime = -1;
    // async function predictWebcam(video: HTMLVideoElement) {
    async function predictWebcam() {

        let startTimeMs = performance.now();

        // Detect faces using detectForVideo
        if (webcamRef.current?.currentTime !== lastVideoTime) {
            lastVideoTime = webcamRef.current!.currentTime;
            const detections = faceDetector.detectForVideo(webcamRef.current!, startTimeMs).detections;
            // displayVideoDetections(detections, webcamRef.current!);
        }

        // Call this function again to keep predicting when the browser is ready
        window.requestAnimationFrame(predictWebcam);
    }

    function displayVideoDetections(detections: any[], video: HTMLVideoElement) {
        // Remove any highlighting from previous frame.
        const liveView = document.getElementById("liveView") as HTMLDivElement;

        for (let child of children) {
            liveView.removeChild(child);
        }
        children.splice(0);

        // Iterate through predictions and draw them to the live view
        for (let detection of detections) {
            const p: HTMLParagraphElement = document.createElement("p");
            console.log(Math.round(parseFloat(detection.categories[0].score) * 100) + "% .")
            p.innerText = "Confidence: " + Math.round(parseFloat(detection.categories[0].score) * 100) + "% .";
            p.setAttribute('style',
                "left: " + (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
                "top: " + (detection.boundingBox.originY - 30) + "px;" +
                "width: " + (detection.boundingBox.width - 10) + "px;"
            )

            // console.log(detection)
            const highlighter: HTMLDivElement = document.createElement("div");
            highlighter.setAttribute("class", "highlighter");
            highlighter.setAttribute('style',
                "left: " + (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) + "px;" +
                "top: " + detection.boundingBox.originY + "px;" +
                "width: " + (detection.boundingBox.width - 10) + "px;" +
                "height: " + detection.boundingBox.height + "px;"
            )

            liveView.appendChild(highlighter);
            liveView.appendChild(p);

            // Store drawn objects in memory so they are queued to delete at next call
            children.push(highlighter);
            children.push(p);

            for (let keypoint of detection.keypoints) {
                const keypointEl: HTMLSpanElement = document.createElement("span");
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
        canvas.width = 500
        canvas.height = 720

        try {
            // console.log(canvas.width, canvas.height, webcamRef.current?.videoWidth, webcamRef.current?.videoHeight)
            canvas.getContext('2d')!.drawImage(webcamRef.current!, 0, 0, webcamRef.current!.videoWidth, webcamRef.current!.videoHeight);
            let image_data_url = canvas.toDataURL('image/jpeg');

            console.log(image_data_url);
            setImageCapture(image_data_url)
            // window.location.href = frame;
        } catch (err) {
            console.error("Error: " + err);
        }
    };


    return (
        <>
            <div className='p-5'>
                {/* <section>
                    <img style={{width: '100%'}} src={require('../assets/bg-camera.png')} />
                    <div id="liveView">
                        <video style={{width: '100%'}} ref={webcamRef} id="webcam" autoPlay playsInline></video>
                    </div>
                    <button className="bg-indigo-500 rounded-2xl px-5 py-3 text-white" onClick={capture} title="Click to live face detection">Capture</button>
                    {imageCapture &&
                        <img alt="" src={imageCapture} />
                    }
                </section > */}
                <section className="stacked-section">
                    <img className="bg-image" alt="" src={require('../assets/bg-camera.png')} />
                    <div id="liveView" className="video-container">
                        <video style={{ width: '100%', height: '100vh', objectFit: 'cover' }} ref={webcamRef} id="webcam" autoPlay playsInline></video>
                        {/* <video style={{width: '100%', height: '100vh'}} ref={webcamRef} id="webcam" autoPlay playsInline></video> */}
                    </div>
                    {/* <button className="bg-indigo-500 rounded-2xl px-5 py-3 text-white" onClick={capture} title="Click to live face detection">Capture</button>
                    {imageCapture &&
                        <img alt="" src={imageCapture} />
                    } */}
                </section>
            </div>
        </>
    );
}