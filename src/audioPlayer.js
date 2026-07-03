let audioContext;
const audioBufferCache = new Map();

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

async function loadAudioBuffer(url) {
    if (!audioBufferCache.has(url)) {
        const bufferPromise = fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load audio: ${url}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const context = getAudioContext();
                if (!context) return null;
                return context.decodeAudioData(arrayBuffer);
            });
        audioBufferCache.set(url, bufferPromise);
    }

    return audioBufferCache.get(url);
}

export async function playSound(fileName, volume) {
    if (volume <= 0 || typeof window === "undefined") return;

    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
        await context.resume();
    }

    const url = `${process.env.PUBLIC_URL}/${fileName}`;
    const audioBuffer = await loadAudioBuffer(url);
    if (!audioBuffer) return;

    const source = context.createBufferSource();
    const gainNode = context.createGain();
    gainNode.gain.value = volume;
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(0);
}
