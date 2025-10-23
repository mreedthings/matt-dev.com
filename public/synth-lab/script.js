const notes = [
    { name: 'C', baseOctave: 4, frequency: 261.63, key: 'a' },
    { name: 'D', baseOctave: 4, frequency: 293.66, key: 's' },
    { name: 'E', baseOctave: 4, frequency: 329.63, key: 'd' },
    { name: 'F', baseOctave: 4, frequency: 349.23, key: 'f' },
    { name: 'G', baseOctave: 4, frequency: 392.00, key: 'g' },
    { name: 'A', baseOctave: 4, frequency: 440.00, key: 'h' },
    { name: 'B', baseOctave: 4, frequency: 493.88, key: 'j' },
    { name: 'C', baseOctave: 5, frequency: 523.25, key: 'k' },
];

const OCTAVE_RANGE = { min: -2, max: 2 };

const defaultState = {
    waveform: 'triangle',
    toneGain: 0.04,
    toneAttack: 0.01,
    toneDecay: 0.08,
    toneSustain: 0.015,
    toneRelease: 0.2,

    overtoneGain: 0.02,
    overtoneRatio: 2.6,
    overtoneDecay: 0.09,

    noiseAmount: 0.018,
    noiseHighpass: 2500,
    noiseQ: 1.6,
    noiseDecay: 0.045,
    octaveOffset: 0,
};

const state = { ...defaultState };

let audioContext = null;

document.addEventListener('DOMContentLoaded', () => {
    setupOctaveControls();
    renderKeyboard();
    renderControls();
    updateCodePreview();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
});

function ensureAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function renderKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    notes.forEach(note => {
        const button = document.createElement('button');
        button.className = 'key';
        button.dataset.noteId = getNoteId(note);
        button.dataset.key = note.key;
        button.innerHTML = `<span class="label">${getNoteLabel(note)}</span><span class="binding">${note.key.toUpperCase()}</span>`;
        button.addEventListener('mousedown', () => {
            button.classList.add('is-active');
            playNote(note);
        });
        button.addEventListener('touchstart', () => {
            button.classList.add('is-active');
            playNote(note);
        }, { passive: true });
        button.addEventListener('mouseup', () => releaseVisual(note));
        button.addEventListener('mouseleave', () => releaseVisual(note));
        button.addEventListener('touchend', () => releaseVisual(note));
        button.addEventListener('touchcancel', () => releaseVisual(note));
        keyboard.appendChild(button);
    });
}

function handleKeyDown(event) {
    const note = notes.find(n => n.key === event.key.toLowerCase());
    if (!note) return;
    if (event.repeat) return;

    const keyEl = getKeyElement(note);
    keyEl?.classList.add('is-active');
    playNote(note);
}

function handleKeyUp(event) {
    const note = notes.find(n => n.key === event.key.toLowerCase());
    if (!note) return;
    releaseVisual(note);
}

function getKeyElement(note) {
    return document.querySelector(`.key[data-note-id="${getNoteId(note)}"]`);
}

function releaseVisual(note) {
    const keyEl = getKeyElement(note);
    keyEl?.classList.remove('is-active');
}

function renderControls() {
    const groups = [
        {
            title: 'Tone Envelope',
            description: 'Primary oscillator shaping the body of the sound.',
            controls: [
                {
                    id: 'waveform',
                    label: 'Waveform',
                    type: 'select',
                    options: ['sine', 'triangle', 'square', 'sawtooth'],
                },
                { id: 'toneGain', label: 'Peak Gain', min: 0, max: 0.12, step: 0.001 },
                { id: 'toneAttack', label: 'Attack (s)', min: 0.001, max: 0.1, step: 0.001 },
                { id: 'toneDecay', label: 'Decay (s)', min: 0.01, max: 0.3, step: 0.005 },
                { id: 'toneSustain', label: 'Sustain Level', min: 0, max: 0.06, step: 0.001 },
                { id: 'toneRelease', label: 'Release (s)', min: 0.05, max: 0.6, step: 0.01 },
            ],
        },
        {
            title: 'Overtone',
            description: 'Second oscillator for articulation and definition.',
            controls: [
                { id: 'overtoneGain', label: 'Gain', min: 0, max: 0.08, step: 0.001 },
                { id: 'overtoneRatio', label: 'Frequency Ratio', min: 1.2, max: 4, step: 0.05 },
                { id: 'overtoneDecay', label: 'Decay (s)', min: 0.02, max: 0.3, step: 0.005 },
            ],
        },
        {
            title: 'Noise',
            description: 'High-frequency hiss to soften transitions.',
            controls: [
                { id: 'noiseAmount', label: 'Amount', min: 0, max: 0.05, step: 0.001 },
                { id: 'noiseHighpass', label: 'High-pass (Hz)', min: 500, max: 6000, step: 10 },
                { id: 'noiseQ', label: 'Resonance (Q)', min: 0.5, max: 10, step: 0.1 },
                { id: 'noiseDecay', label: 'Decay (s)', min: 0.01, max: 0.25, step: 0.005 },
            ],
        },
    ];

    const container = document.getElementById('control-groups');

    groups.forEach(group => {
        const wrapper = document.createElement('div');
        wrapper.className = 'group';

        const title = document.createElement('h3');
        title.className = 'group-title';
        title.innerHTML = `${group.title} <span>— ${group.description}</span>`;
        wrapper.appendChild(title);

        group.controls.forEach(control => {
            const controlEl = document.createElement('div');
            controlEl.className = 'control';

            const label = document.createElement('label');
            label.setAttribute('for', control.id);
            label.textContent = control.label;
            controlEl.appendChild(label);

            let input;

            if (control.type === 'select') {
                input = document.createElement('select');
                control.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option;
                    input.appendChild(optionEl);
                });
                input.value = state[control.id];
            } else {
                input = document.createElement('input');
                input.type = 'range';
                input.min = control.min;
                input.max = control.max;
                input.step = control.step;
                input.value = state[control.id];
            }

            input.id = control.id;
            input.addEventListener('input', event => {
                const value = control.type === 'select'
                    ? event.target.value
                    : Number(event.target.value);
                state[control.id] = value;
                updateValueDisplay(control.id, value);
                updateCodePreview();
            });

            controlEl.appendChild(input);

            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'value';
            valueDisplay.id = `${control.id}-value`;
            valueDisplay.textContent = formatValue(control.id, state[control.id]);
            controlEl.appendChild(valueDisplay);

            wrapper.appendChild(controlEl);
        });

        container.appendChild(wrapper);
    });
}

function formatValue(id, value) {
    if (typeof value === 'string') {
        return value;
    }

    if (id.includes('Frequency') || id.includes('Highpass') || id.includes('High-pass')) {
        return `${Math.round(value)} Hz`;
    }

    if (id.toLowerCase().includes('ratio')) {
        return value.toFixed(2);
    }

    if (id.toLowerCase().includes('gain') || id.toLowerCase().includes('amount') || id.toLowerCase().includes('level')) {
        return value.toFixed(3);
    }

    if (id.toLowerCase().includes('decay') || id.toLowerCase().includes('attack') || id.toLowerCase().includes('release')) {
        return `${value.toFixed(3)} s`;
    }

    if (id.toLowerCase().includes('q')) {
        return value.toFixed(2);
    }

    return value.toFixed(3);
}

function updateValueDisplay(id, value) {
    const display = document.getElementById(`${id}-value`);
    if (display) {
        display.textContent = formatValue(id, value);
    }
}

function playNote(note) {
    ensureAudioContext();
    const now = audioContext.currentTime;
    const frequency = getFrequency(note);

    const master = audioContext.createGain();
    master.gain.setValueAtTime(1, now);
    master.connect(audioContext.destination);

    createToneOscillator(frequency, master, now);
    createOvertone(frequency, master, now);
    createNoise(master, now);

    const duration = state.toneAttack + state.toneDecay + state.toneRelease + 0.1;
    setTimeout(() => releaseVisual(note), duration * 1000);
}

function createToneOscillator(frequency, destination, now) {
    const osc = audioContext.createOscillator();
    osc.type = state.waveform;
    osc.frequency.setValueAtTime(frequency, now);

    const gain = audioContext.createGain();
    const peak = Math.max(state.toneGain, 0.0001);
    const sustain = Math.max(state.toneSustain, 0.0001);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + state.toneAttack);
    gain.gain.linearRampToValueAtTime(sustain, now + state.toneAttack + state.toneDecay);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + state.toneAttack + state.toneDecay + state.toneRelease);

    osc.connect(gain);
    gain.connect(destination);

    const stopTime = now + state.toneAttack + state.toneDecay + state.toneRelease + 0.05;
    osc.start(now);
    osc.stop(stopTime);
}

function createOvertone(frequency, destination, now) {
    if (state.overtoneGain <= 0.0005) {
        return;
    }

    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * state.overtoneRatio, now);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(state.overtoneGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + state.overtoneDecay);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + state.overtoneDecay + 0.05);
}

function createNoise(destination, now) {
    if (state.noiseAmount <= 0.0005) {
        return;
    }

    const duration = state.noiseDecay;
    const sampleCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
        const envelope = Math.exp(-30 * (i / sampleCount));
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(state.noiseHighpass, now);
    filter.Q.setValueAtTime(state.noiseQ, now);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(state.noiseAmount, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    source.start(now);
    source.stop(now + duration);
}

function buildToneDefinition() {
    return {
        id: 'custom-tone',
        label: 'Custom Tone',
        octaveOffset: state.octaveOffset,
        components: {
            tone: {
                waveform: state.waveform,
                gain: state.toneGain,
                envelope: {
                    attack: state.toneAttack,
                    decay: state.toneDecay,
                    sustain: state.toneSustain,
                    release: state.toneRelease,
                },
            },
            overtone: {
                gain: state.overtoneGain,
                ratio: state.overtoneRatio,
                decay: state.overtoneDecay,
            },
            noise: {
                amount: state.noiseAmount,
                highpassFrequency: state.noiseHighpass,
                q: state.noiseQ,
                decay: state.noiseDecay,
            },
        },
    };
}

function updateCodePreview() {
    const codeEl = document.getElementById('code-preview');
    const toneDefinition = buildToneDefinition();
    codeEl.textContent = `const tone = ${JSON.stringify(toneDefinition, null, 2)};`;
}

function setupOctaveControls() {
    const down = document.getElementById('octave-down');
    const up = document.getElementById('octave-up');

    if (down) {
        down.addEventListener('click', () => adjustOctave(-1));
    }

    if (up) {
        up.addEventListener('click', () => adjustOctave(1));
    }

    updateOctaveDisplay();
}

function adjustOctave(delta) {
    const next = clamp(state.octaveOffset + delta, OCTAVE_RANGE.min, OCTAVE_RANGE.max);
    if (next === state.octaveOffset) {
        return;
    }

    state.octaveOffset = next;
    renderKeyboard();
    updateOctaveDisplay();
    updateCodePreview();
}

function updateOctaveDisplay() {
    const display = document.getElementById('octave-display');
    if (display) {
        const prefix = state.octaveOffset > 0 ? '+' : '';
        display.textContent = `Octave Offset ${prefix}${state.octaveOffset}`;
    }

    const down = document.getElementById('octave-down');
    const up = document.getElementById('octave-up');

    if (down) {
        down.disabled = state.octaveOffset <= OCTAVE_RANGE.min;
    }
    if (up) {
        up.disabled = state.octaveOffset >= OCTAVE_RANGE.max;
    }
}

function getNoteId(note) {
    return `${note.name}${note.baseOctave}`;
}

function getNoteLabel(note) {
    return `${note.name}${note.baseOctave + state.octaveOffset}`;
}

function getFrequency(note) {
    return note.frequency * Math.pow(2, state.octaveOffset);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
