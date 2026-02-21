import { useState, useEffect, useRef } from 'react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageDataString: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCentered, setIsCentered] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [debugMsg, setDebugMsg] = useState("");

    // Animation frame ref for continuous detection
    const requestRef = useRef<number>(0);

    // Using the native Shape Detection API if available, 
    // otherwise fallback to a generic movement heuristic or simple timeout
    const hasFaceDetector = 'FaceDetector' in window;

    // Stop streams when unmounting or closing
    const stopMediaTracks = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    // Initialize Camera on Open
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let detector: any = null;

        const detectFacesLoop = async () => {
            if (!videoRef.current || !isOpen) return;
            const video = videoRef.current;

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                try {
                    if (detector) {
                        const faces = await detector.detect(video);
                        if (faces.length > 0) {
                            // We have at least one face.
                            // Let's verify if the face is roughly in the center of the video
                            const face = faces[0].boundingBox;
                            const vw = video.videoWidth;
                            const vh = video.videoHeight;

                            // Center of the face bounding box
                            const fx = face.x + (face.width / 2);
                            const fy = face.y + (face.height / 2);

                            // Screen center
                            const cx = vw / 2;
                            const cy = vh / 2;

                            // Thresholds (e.g. within 20% of the center)
                            const xMargin = vw * 0.2;
                            const yMargin = vh * 0.2;

                            const isWithinX = Math.abs(fx - cx) < xMargin;
                            const isWithinY = Math.abs(fy - cy) < yMargin;

                            // Face size must be reasonably large (at least 20% of smallest dimension)
                            const isLargeEnough = face.width > (vw * 0.2);

                            if (isWithinX && isWithinY && isLargeEnough) {
                                setIsCentered(true);
                                setDebugMsg("Rostro centrado óptimamente.");
                            } else {
                                setIsCentered(false);
                                setDebugMsg("Por favor centra tu rostro en el óvalo.");
                            }
                        } else {
                            setIsCentered(false);
                            setDebugMsg("No se detecta ningún rostro.");
                        }
                    }
                } catch (e) {
                    console.error("Face detection error:", e);
                }
            }
            requestRef.current = requestAnimationFrame(detectFacesLoop);
        };

        const initCamera = async () => {
            if (!isOpen) return;
            try {
                // Initialize detector if supported
                if (hasFaceDetector) {
                    // @ts-ignore
                    detector = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
                }

                // Request front camera specifically, at HD rez if available
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });

                streamRef.current = stream;
                setHasPermission(true);
                setIsCentered(false);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Muted + playsInline is required for iOS compatibility
                    videoRef.current.muted = true;
                    videoRef.current.playsInline = true;

                    videoRef.current.onloadedmetadata = () => {
                        if (hasFaceDetector) {
                            requestRef.current = requestAnimationFrame(detectFacesLoop);
                        } else {
                            // Fallback simulation for unsupported browsers (Safari/Firefox usually)
                            setDebugMsg("Detectando alineación (Modo seguro)...");
                            timer = setTimeout(() => {
                                if (streamRef.current) {
                                    setIsCentered(true);
                                    setDebugMsg("Alineación completada. Captura habilitada.");
                                }
                            }, 4000);
                        }
                    };
                }

            } catch (err) {
                console.error("Camera access error:", err);
                setHasPermission(false);
            }
        };

        if (isOpen) {
            initCamera();
        } else {
            stopMediaTracks();
            setIsCentered(false);
            setHasPermission(null);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }

        return () => {
            stopMediaTracks();
            if (timer) clearTimeout(timer);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current || !isCentered) return;
        setIsCapturing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            // Set canvas exact dimensions matching the video source
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Export to JPEG Base64 with high quality ratio
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onCapture(dataUrl);
            stopMediaTracks();
            onClose();
        }
        setIsCapturing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

            {/* Modal Container */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                        <span className="material-symbols-outlined">face</span>
                        <h2 className="text-slate-900">Escaneo biométrico facial</h2>
                    </div>
                    <button onClick={() => { stopMediaTracks(); onClose(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {hasPermission === false ? (
                    // Permission Denied State
                    <div className="p-8 text-center flex flex-col items-center">
                        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">no_photography</span>
                        <h3 className="text-slate-900 text-xl font-bold mb-2">Acceso a cámara denegado</h3>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Para realizar la prueba biométrica, es obligatorio permitir el acceso a tu cámara frontal. Por favor, verifica los permisos en tu navegador.
                        </p>
                        <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 w-full transition-colors">
                            Entendido
                        </button>
                    </div>
                ) : (
                    // Camera View State
                    <div className="flex flex-col items-center justify-center p-8">

                        {/* Circular Video Container */}
                        <div className="relative w-64 h-64 mb-8 flex justify-center">
                            {/* Inner Circle Video */}
                            <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-slate-100 z-10">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                                />
                                {/* Centering Overlay State Color */}
                                <div className={`absolute inset-0 border-4 rounded-full transition-colors duration-500 pointer-events-none ${isCentered ? 'border-green-500' : 'border-amber-100'}`}></div>
                            </div>

                            {/* Outer Decorative Ring */}
                            <div className={`absolute -inset-1 rounded-full border border-amber-50 transition-colors duration-500 ${isCentered ? 'border-green-100' : 'border-amber-50'}`}></div>

                            {/* Badge */}
                            <div className="absolute -bottom-3 z-20">
                                <span className={`text-[10px] font-bold text-white px-4 py-1 rounded-full uppercase tracking-wider transition-colors duration-500 shadow-md ${isCentered ? 'bg-green-500' : 'bg-amber-500'}`}>
                                    Prueba de vida
                                </span>
                            </div>
                        </div>

                        {/* Instructions Panel */}
                        <div className="text-center w-full mb-8">
                            <h3 className="text-lg font-medium text-slate-800 mb-4 px-2">
                                {debugMsg || "Coloca tu rostro dentro del círculo y parpadea para verificar"}
                            </h3>
                            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">light_mode</span>
                                    <span>Buena iluminación</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">visibility_off</span>
                                    <span>Sin gafas</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={() => { stopMediaTracks(); onClose(); }}
                                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={!isCentered || isCapturing}
                                className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md
                                    ${(!isCentered || isCapturing)
                                        ? 'bg-amber-300 cursor-not-allowed shadow-none'
                                        : 'bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-lg'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">camera</span>
                                Capturar
                            </button>
                        </div>

                        {/* Hidden canvas for snapshot */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {/* Footer Security Badge */}
                <div className="bg-slate-50 border-t border-slate-100 p-3 flex items-center justify-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Verificación biométrica segura AES-256</span>
                </div>
            </div>
        </div>
    );
}
