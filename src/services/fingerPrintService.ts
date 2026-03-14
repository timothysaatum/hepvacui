/**
 * fingerprintService.ts
 *
 * Collects hardware-level browser signals and produces a stable SHA-256
 * fingerprint that is sent to the server on every login attempt via the
 * X-Device-Fingerprint header.
 *
 * Signal categories:
 *  - Canvas 2D rendering (GPU + font rendering pipeline)
 *  - WebGL renderer & vendor strings (GPU identity)
 *  - AudioContext characteristics (DSP/audio stack)
 *  - Screen geometry, pixel ratio, color depth
 *  - Platform, language, timezone, hardware concurrency, device memory
 *  - Installed font detection (subset probe)
 *
 * None of these signals is individually unique or reliable, but their
 * combination produces a fingerprint that is highly stable across sessions
 * for the same physical device while being distinct across different devices.
 *
 * Privacy note: the fingerprint is a one-way hash.  The raw signal values
 * are never sent to or stored by the server.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Individual collectors
// ─────────────────────────────────────────────────────────────────────────────

/** Canvas 2D: renders text and shapes; the output differs per GPU + driver. */
async function canvasFingerprint(): Promise<string> {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        // Text rendering — differs by font hinting, sub-pixel rendering, GPU
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 280, 60);
        ctx.fillStyle = '#069';
        ctx.fillText('HepVac🩺 fingerprint 0123456789 !@#$', 2, 15);
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.fillText('HepVac🩺 fingerprint 0123456789 !@#$', 4, 35);

        // Shape rendering — arc anti-aliasing differs per GPU
        ctx.beginPath();
        ctx.arc(100, 50, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,0,255,0.6)';
        ctx.fill();

        return canvas.toDataURL();
    } catch {
        return 'canvas-error';
    }
}

/** WebGL: extract renderer and vendor strings from the GPU driver. */
function webglFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const gl = (
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
        ) as WebGLRenderingContext | null;

        if (!gl) return 'no-webgl';

        // WEBGL_debug_renderer_info is deprecated in Firefox 120+ and will be
        // removed. Attempt to use it but fall back to the standard RENDERER /
        // VENDOR parameters which are available in all browsers without an
        // extension. The standard values are sometimes masked ("Google Inc.")
        // but still contribute entropy when combined with other signals.
        let renderer = '';
        let vendor = '';
        try {
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            if (ext) {
                renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '';
                vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) ?? '';
            }
        } catch {
            // Extension unavailable or blocked — use standard params below
        }
        if (!renderer) renderer = gl.getParameter(gl.RENDERER) ?? 'unknown';
        if (!vendor) vendor = gl.getParameter(gl.VENDOR) ?? 'unknown';

        return `${vendor}~${renderer}`;
    } catch {
        return 'webgl-error';
    }
}

/** AudioContext: the DSP output differs by OS audio stack and hardware. */
async function audioFingerprint(): Promise<string> {
    try {
        const AudioCtx =
            window.AudioContext ||
            (window as any).webkitAudioContext;
        if (!AudioCtx) return 'no-audio';

        const ctx = new AudioCtx();
        const oscillator = ctx.createOscillator();
        const analyser = ctx.createAnalyser();
        const gain = ctx.createGain();
        const scriptProc = ctx.createScriptProcessor(4096, 1, 1);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime); // silent — never audible

        oscillator.connect(analyser);
        analyser.connect(scriptProc);
        scriptProc.connect(gain);
        gain.connect(ctx.destination);

        return await new Promise<string>(resolve => {
            // onaudioprocess is a streaming callback — it fires once per audio buffer
            // chunk (every ~93ms at 44100Hz / 4096 samples). Without a guard, the
            // handler fires again after the first chunk before the disconnect takes
            // effect, calling ctx.close() a second time → DOMException.
            let fired = false;

            scriptProc.onaudioprocess = (e) => {
                if (fired) return;
                fired = true;

                const samples = e.inputBuffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < samples.length; i++) {
                    sum += Math.abs(samples[i]);
                }

                // Disconnect all nodes before closing — order matters.
                oscillator.disconnect();
                analyser.disconnect();
                scriptProc.disconnect();
                gain.disconnect();

                // ctx.close() returns a Promise — ignore rejections here since we
                // already captured the sample value we needed.
                ctx.close().catch(() => { });

                resolve(sum.toString());
            };
            oscillator.start(0);
        });
    } catch {
        return 'audio-error';
    }
}

/** Probe whether a font is installed by measuring rendered text width. */
function fontProbe(font: string, testChar = 'mmmmmmmmmmlli'): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `72px ${font}, monospace`;
    return ctx.measureText(testChar).width;
}

function installedFonts(): string {
    const probes = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
        'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS',
        'Impact', 'Comic Sans MS', 'Tahoma', 'Segoe UI', 'Calibri',
        'Lucida Sans', 'Ubuntu', 'Roboto', 'Open Sans', 'Noto Sans',
    ];
    const baseWidth = fontProbe('__NONE_INSTALLED__');
    return probes
        .filter(f => fontProbe(f) !== baseWidth)
        .join(',');
}

/** Stable platform signals — these rarely change between sessions. */
function platformSignals(): Record<string, string | number | boolean> {
    const nav = navigator;
    return {
        userAgent: nav.userAgent,
        language: nav.language,
        languages: (nav.languages || []).join(','),
        platform: nav.platform,
        hardwareConcurrency: nav.hardwareConcurrency ?? -1,
        deviceMemory: (nav as any).deviceMemory ?? -1,
        maxTouchPoints: nav.maxTouchPoints ?? 0,
        cookiesEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack ?? 'unset',
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenDepth: screen.colorDepth,
        screenPixelRatio: window.devicePixelRatio,
        screenAvailWidth: screen.availWidth,
        screenAvailHeight: screen.availHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        localStorage: (() => { try { return !!window.localStorage; } catch { return false; } })(),
        sessionStorage: (() => { try { return !!window.sessionStorage; } catch { return false; } })(),
        indexedDB: !!window.indexedDB,
        webWorker: !!window.Worker,
        serviceWorker: 'serviceWorker' in navigator,
        webAssembly: typeof WebAssembly === 'object',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHA-256 hasher (Web Crypto API — no dependencies)
// ─────────────────────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
    const encoded = new TextEncoder().encode(text);
    const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface FingerprintResult {
    /** The SHA-256 fingerprint to send to the server. */
    fingerprint: string;
    /** Version tag so the server can detect algorithm changes. */
    version: string;
}

const VERSION = 'v2';

/**
 * Generate a hardware-level device fingerprint.
 *
 * Collects canvas, WebGL, audio, screen, platform and font signals,
 * concatenates them into a canonical string, and returns a SHA-256 hash.
 *
 * The raw signals are never transmitted — only the hash.
 *
 * @example
 * const { fingerprint } = await generateFingerprint();
 * // Send as header: X-Device-Fingerprint: v2:<fingerprint>
 */
export async function generateFingerprint(): Promise<FingerprintResult> {
    // Run the async collectors in parallel — they don't share state
    const [canvasData, audioData] = await Promise.all([
        canvasFingerprint(),
        audioFingerprint(),
    ]);

    const webglData = webglFingerprint();
    const fontData = installedFonts();
    const platform = platformSignals();

    // Produce a deterministic canonical string from all signals
    const canonical = JSON.stringify({
        v: VERSION,
        canvas: await sha256(canvasData),
        webgl: webglData,
        audio: audioData,
        fonts: await sha256(fontData),
        platform,
    });

    const fingerprint = await sha256(canonical);

    return { fingerprint, version: VERSION };
}

/**
 * Cache the fingerprint for the lifetime of the page so we don't
 * re-compute it on every keystroke in the login form.
 */
let _cached: Promise<FingerprintResult> | null = null;

export function getFingerprint(): Promise<FingerprintResult> {
    if (!_cached) {
        _cached = generateFingerprint();
    }
    return _cached;
}

/** Call this if you need to force a fresh fingerprint (e.g. after logout). */
export function clearFingerprintCache(): void {
    _cached = null;
}

/**
 * Call this once on first user interaction (e.g. first keydown/click on the
 * login form). Starts fingerprint collection early so it's ready by submit.
 *
 * AudioContext requires a user gesture before it can start — calling this
 * from a click or keydown handler satisfies that requirement. Do NOT call
 * it on module load or in a useEffect with no interaction trigger.
 */
export function warmFingerprintCache(): void {
    if (!_cached) {
        _cached = generateFingerprint().catch(() => {
            _cached = null;
            return { fingerprint: '0'.repeat(64), version: VERSION };
        });
    }
}