/**
 * Universal Dual-Mode Camera & File Media Picker
 * Real WebRTC Camera Hardware Access (Environment/Rear Lens) + Local Device File/Gallery Selection
 * Design Variation 3: Deep carbon aesthetic, phosphor accent controls, Space Mono labels
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Video, 
  Image as ImageIcon,
  X
} from 'lucide-react';

interface CameraMediaPickerProps {
  onImageSelected: (base64OrUrl: string | null) => void;
  label?: string;
  initialImage?: string | null;
  className?: string;
}

export const CameraMediaPicker: React.FC<CameraMediaPickerProps> = ({
  onImageSelected,
  label = 'Photo Evidence / Proof of Work',
  initialImage = null,
  className = ''
}) => {
  const [mode, setMode] = useState<'camera' | 'file'>('camera');
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly on unmount or tab switch
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsLoadingCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Start real device camera hardware
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingCamera(true);
    setCapturedImage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser environment. Switched to device file picker.');
      setIsLoadingCamera(false);
      setMode('file');
      return;
    }

    try {
      // Prioritize environment/rear camera on mobile/tablet devices
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStreamActive(true);
          setIsLoadingCamera(false);
        };
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      let message = 'Unable to access device camera hardware.';
      const errorObj = err as { name?: string };

      if (errorObj?.name === 'NotAllowedError' || errorObj?.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in browser permissions or pick from gallery.';
      } else if (errorObj?.name === 'NotFoundError' || errorObj?.name === 'DevicesNotFoundError') {
        message = 'No camera hardware found on this device. Switched to file upload.';
      }

      setCameraError(message);
      setIsLoadingCamera(false);
      // Automatically switch to file mode fallback
      setTimeout(() => {
        setMode('file');
      }, 1500);
    }
  };

  // Snap photo frame to canvas and generate Base64
  const snapPicture = () => {
    if (!videoRef.current || !canvasRef.current || !streamActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);

      setCapturedImage(base64);
      onImageSelected(base64);
      stopCameraStream();
    }
  };

  // Retake photo
  const retakePicture = () => {
    setCapturedImage(null);
    onImageSelected(null);
    startCamera();
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFilePreview(result);
        setCapturedImage(null);
        onImageSelected(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setCapturedImage(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs font-mono-tech uppercase tracking-wide text-[#5ef38c]">
          [ {label} ]
        </label>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 bg-[var(--surface-muted)] border border-[var(--border)]">
        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            setMode('camera');
          }}
          className={`flex-1 py-2 px-3 text-xs font-mono-tech uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
            mode === 'camera'
              ? 'bg-[#5ef38c] text-[#0c0c0e] font-bold'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            setMode('file');
          }}
          className={`flex-1 py-2 px-3 text-xs font-mono-tech uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
            mode === 'file'
              ? 'bg-[#5ef38c] text-[#0c0c0e] font-bold'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Device Storage</span>
        </button>
      </div>

      {/* Mode 1: Live WebRTC Camera Hardware */}
      {mode === 'camera' && (
        <div className="border border-[var(--border)] p-4 bg-white/[0.03] backdrop-blur-md space-y-3">
          {cameraError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono-tech flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Camera Viewport / Captured Preview */}
          <div className="relative w-full h-60 bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden flex items-center justify-center text-[var(--ink)]">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* Captured Snapshot Display */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
            )}

            {/* Idle State / Placeholder */}
            {!streamActive && !capturedImage && (
              <div className="text-center p-4 text-[var(--ink-muted)]">
                <Video className="w-8 h-8 mx-auto mb-2 text-[#5ef38c]" />
                <span className="text-xs font-mono-tech uppercase block text-[var(--ink)] mb-1">
                  {isLoadingCamera ? 'Connecting camera hardware...' : 'Hardware Standby'}
                </span>
                <span className="text-[11px] text-[var(--ink-muted)]">
                  Environment rear lens enabled for mobile
                </span>
              </div>
            )}

            {/* Live Indicator Badge */}
            {streamActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono-tech uppercase font-bold flex items-center gap-1.5 border border-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>CAMERA FEED ACTIVE</span>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono-tech">
            {!streamActive && !capturedImage && (
              <button
                type="button"
                onClick={startCamera}
                disabled={isLoadingCamera}
                className="btn-v3 btn-v3-primary text-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Hardware</span>
              </button>
            )}

            {streamActive && (
              <button
                type="button"
                onClick={snapPicture}
                className="btn-v3 btn-v3-primary text-xs"
              >
                <Check className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            )}

            {capturedImage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={retakePicture}
                  className="btn-v3 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="btn-v3 text-xs text-red-400 border-red-500/40 hover:bg-red-950/40 hover:text-red-200"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Local Device Storage / Gallery */}
      {mode === 'file' && (
        <div className="border border-[var(--border)] p-4 bg-[var(--surface)] space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!filePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[var(--border-bright)] hover:border-[#5ef38c] p-8 text-center cursor-pointer transition bg-[var(--surface-muted)] group"
            >
              <ImageIcon className="w-8 h-8 text-[var(--ink-muted)] mx-auto mb-2 group-hover:text-[#5ef38c] transition-colors" />
              <div className="text-xs font-mono-tech uppercase text-[var(--ink)]">
                Click to browse device gallery / files
              </div>
              <div className="text-[10px] text-[var(--ink-muted)] font-mono-tech mt-1">
                JPG, PNG, WEBP UP TO 2MB
              </div>
            </div>
          ) : (
            <div className="relative w-full h-60 bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
              <img
                src={filePreview}
                alt="File preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeSelectedImage}
                className="absolute top-2 right-2 p-1.5 bg-[var(--surface-muted)]/80 hover:bg-[var(--surface-muted)] border border-[var(--border-bright)] text-[var(--ink)] transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
