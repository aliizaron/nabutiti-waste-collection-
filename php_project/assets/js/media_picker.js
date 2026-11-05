/**
 * Universal Dual-Mode Media Picker (Live WebRTC Camera Hardware + Local Device Storage)
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

class DualMediaPicker {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`DualMediaPicker: Container #${containerId} not found.`);
            return;
        }

        this.options = Object.assign({
            inputNameHidden: 'captured_image',
            inputNameFile: 'uploaded_file',
            initialMode: 'camera', // 'camera' or 'file'
            onCapture: null
        }, options);

        this.stream = null;
        this.capturedBase64 = null;
        this.initDOM();
        this.attachEvents();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="card border rounded-3 p-3 bg-light shadow-sm">
                <!-- Nav Tabs -->
                <ul class="nav nav-pills nav-fill mb-3" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active btn-sm" id="tab-camera-btn" type="button">
                            <i class="bi bi-camera-video-fill me-1"></i> Live Camera Snapshot
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn-sm" id="tab-file-btn" type="button">
                            <i class="bi bi-folder-fill me-1"></i> Device Storage / Gallery
                        </button>
                    </li>
                </ul>

                <!-- Camera Hardware Panel -->
                <div id="panel-camera" class="media-panel">
                    <div class="position-relative bg-dark rounded-3 overflow-hidden text-center mb-2" style="min-height: 240px; display: flex; align-items: center; justify-content: center;">
                        <video id="camera-stream" autoplay playsinline muted class="w-100 h-100 object-fit-cover" style="max-height: 320px; display: none;"></video>
                        <canvas id="snapshot-canvas" style="display: none;"></canvas>
                        <img id="snapshot-preview" class="w-100 h-100 object-fit-cover" style="max-height: 320px; display: none;" alt="Captured snapshot preview">
                        
                        <div id="camera-idle-placeholder" class="p-4 text-white-50">
                            <i class="bi bi-camera fs-1 d-block mb-2 text-success"></i>
                            <span class="small d-block">Camera hardware is idle.</span>
                            <span class="text-white-50" style="font-size: 11px;">Uses environment-facing lens on mobile devices</span>
                        </div>
                    </div>

                    <div id="camera-alert" class="alert alert-warning py-1.5 px-3 small d-none mb-2" role="alert"></div>

                    <!-- Camera Control Buttons -->
                    <div class="d-flex gap-2 justify-content-center">
                        <button type="button" id="btn-start-camera" class="btn btn-outline-success btn-sm">
                            <i class="bi bi-play-circle me-1"></i> Start Camera
                        </button>
                        <button type="button" id="btn-snap-picture" class="btn btn-success btn-sm d-none">
                            <i class="bi bi-camera-fill me-1"></i> Snap Picture
                        </button>
                        <button type="button" id="btn-retake-picture" class="btn btn-outline-secondary btn-sm d-none">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Retake
                        </button>
                    </div>
                </div>

                <!-- Device Storage / Gallery Panel -->
                <div id="panel-file" class="media-panel d-none">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-secondary">Select photo from device storage or gallery:</label>
                        <input type="file" id="file-input" name="${this.options.inputNameFile}" class="form-control form-control-sm" accept="image/jpeg,image/png,image/webp">
                        <div class="form-text small" style="font-size: 11px;">Permitted formats: JPG, PNG, WebP (Max 2MB)</div>
                    </div>

                    <div id="file-preview-wrapper" class="text-center rounded-3 bg-white border p-2 d-none" style="max-height: 260px; overflow: hidden;">
                        <img id="file-preview-img" class="img-fluid rounded" style="max-height: 240px;" alt="Selected file preview">
                    </div>
                </div>

                <!-- Hidden Input for Base64 Data Payload -->
                <input type="hidden" id="hidden-base64-input" name="${this.options.inputNameHidden}" value="">
            </div>
        `;

        // Cache element pointers
        this.tabCameraBtn = this.container.querySelector('#tab-camera-btn');
        this.tabFileBtn   = this.container.querySelector('#tab-file-btn');
        this.panelCamera  = this.container.querySelector('#panel-camera');
        this.panelFile    = this.container.querySelector('#panel-file');

        this.video        = this.container.querySelector('#camera-stream');
        this.canvas       = this.container.querySelector('#snapshot-canvas');
        this.snapPreview  = this.container.querySelector('#snapshot-preview');
        this.idlePlaceholder = this.container.querySelector('#camera-idle-placeholder');
        this.cameraAlert  = this.container.querySelector('#camera-alert');

        this.btnStart     = this.container.querySelector('#btn-start-camera');
        this.btnSnap      = this.container.querySelector('#btn-snap-picture');
        this.btnRetake    = this.container.querySelector('#btn-retake-picture');

        this.fileInput    = this.container.querySelector('#file-input');
        this.filePreviewWrap = this.container.querySelector('#file-preview-wrapper');
        this.filePreviewImg  = this.container.querySelector('#file-preview-img');
        this.hiddenInput  = this.container.querySelector('#hidden-base64-input');
    }

    attachEvents() {
        // Tab switching
        this.tabCameraBtn.addEventListener('click', () => this.switchMode('camera'));
        this.tabFileBtn.addEventListener('click', () => this.switchMode('file'));

        // Camera actions
        this.btnStart.addEventListener('click', () => this.startCameraHardware());
        this.btnSnap.addEventListener('click', () => this.snapSnapshot());
        this.btnRetake.addEventListener('click', () => this.retakeSnapshot());

        // File selection preview
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Clear any camera base64 to avoid collision
                this.hiddenInput.value = '';
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.filePreviewImg.src = evt.target.result;
                    this.filePreviewWrap.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            } else {
                this.filePreviewWrap.classList.add('d-none');
            }
        });
    }

    switchMode(mode) {
        if (mode === 'camera') {
            this.tabCameraBtn.classList.add('active');
            this.tabFileBtn.classList.remove('active');
            this.panelCamera.classList.remove('d-none');
            this.panelFile.classList.add('d-none');
        } else {
            // Stop camera stream when leaving camera tab to preserve battery and privacy
            this.stopCameraHardware();
            this.tabFileBtn.classList.add('active');
            this.tabCameraBtn.classList.remove('active');
            this.panelFile.classList.remove('d-none');
            this.panelCamera.classList.add('d-none');
        }
    }

    async startCameraHardware() {
        this.cameraAlert.classList.add('d-none');
        this.idlePlaceholder.innerHTML = `<div class="spinner-border text-success" role="status"></div><div class="small mt-2 text-white-50">Requesting device camera hardware...</div>`;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.handleCameraFailure('Camera API is not supported in this browser environment. Switched to file upload.');
            return;
        }

        try {
            // Request back/environment camera on phones, fallback to default on desktops
            const constraints = {
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            this.idlePlaceholder.style.display = 'none';
            this.snapPreview.style.display = 'none';

            this.btnStart.classList.add('d-none');
            this.btnSnap.classList.remove('d-none');
            this.btnRetake.classList.add('d-none');
        } catch (err) {
            console.warn('Camera hardware access error:', err);
            let userMsg = 'Could not access device camera hardware.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                userMsg = 'Camera hardware permission was denied. Please grant camera access in browser settings or upload from device storage.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                userMsg = 'No camera hardware found on this device. Switched to device file storage.';
            }
            this.handleCameraFailure(userMsg);
        }
    }

    handleCameraFailure(message) {
        this.stopCameraHardware();
        this.cameraAlert.textContent = message;
        this.cameraAlert.classList.remove('d-none');
        this.idlePlaceholder.style.display = 'block';
        this.idlePlaceholder.innerHTML = `<i class="bi bi-exclamation-triangle-fill fs-2 text-warning d-block mb-1"></i><span class="small text-white-50">${message}</span>`;
        
        // Auto-switch to device storage tab
        setTimeout(() => {
            this.switchMode('file');
        }, 1200);
    }

    snapSnapshot() {
        if (!this.stream || !this.video.videoWidth) return;

        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        this.canvas.width = width;
        this.canvas.height = height;

        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, width, height);

        // Convert canvas to compressed JPEG Base64
        const dataUrl = this.canvas.toDataURL('image/jpeg', 0.85);
        this.capturedBase64 = dataUrl;
        this.hiddenInput.value = dataUrl;

        // Display captured snapshot preview
        this.snapPreview.src = dataUrl;
        this.snapPreview.style.display = 'block';
        this.video.style.display = 'none';

        // Clear any selected file to avoid dual payload ambiguity
        this.fileInput.value = '';
        this.filePreviewWrap.classList.add('d-none');

        // Toggle buttons
        this.btnSnap.classList.add('d-none');
        this.btnRetake.classList.remove('d-none');

        // Stop live stream to conserve battery
        this.stopCameraHardware();

        if (typeof this.options.onCapture === 'function') {
            this.options.onCapture(dataUrl);
        }
    }

    retakeSnapshot() {
        this.capturedBase64 = null;
        this.hiddenInput.value = '';
        this.snapPreview.style.display = 'none';
        this.startCameraHardware();
    }

    stopCameraHardware() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }
}

// Auto-instantiate pickers having the data-media-picker attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-media-picker]').forEach(el => {
        new DualMediaPicker(el.id);
    });
});
