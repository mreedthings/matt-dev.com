const notes = [
    { name: 'C', baseOctave: 4, frequency: 261.63, key: 'a', isBlack: false },
    { name: 'C#', baseOctave: 4, frequency: 277.18, key: 'w', isBlack: true },
    { name: 'D', baseOctave: 4, frequency: 293.66, key: 's', isBlack: false },
    { name: 'D#', baseOctave: 4, frequency: 311.13, key: 'e', isBlack: true },
    { name: 'E', baseOctave: 4, frequency: 329.63, key: 'd', isBlack: false },
    { name: 'F', baseOctave: 4, frequency: 349.23, key: 'f', isBlack: false },
    { name: 'F#', baseOctave: 4, frequency: 369.99, key: 't', isBlack: true },
    { name: 'G', baseOctave: 4, frequency: 392.00, key: 'g', isBlack: false },
    { name: 'G#', baseOctave: 4, frequency: 415.30, key: 'y', isBlack: true },
    { name: 'A', baseOctave: 4, frequency: 440.00, key: 'h', isBlack: false },
    { name: 'A#', baseOctave: 4, frequency: 466.16, key: 'u', isBlack: true },
    { name: 'B', baseOctave: 4, frequency: 493.88, key: 'j', isBlack: false },
    { name: 'C', baseOctave: 5, frequency: 523.25, key: 'k', isBlack: false },
];

const OCTAVE_RANGE = { min: -2, max: 2 };

// Melody definitions (note names with durations in beats, tempo in BPM)
const melodies = {
    twinkle: {
        name: 'Twinkle Twinkle Little Star',
        tempo: 120,
        notes: [
            // "Twinkle twinkle little star"
            { note: 'C', duration: 1 }, { note: 'C', duration: 1 },
            { note: 'G', duration: 1 }, { note: 'G', duration: 1 },
            { note: 'A', duration: 1 }, { note: 'A', duration: 1 },
            { note: 'G', duration: 2 },
            // "How I wonder what you are"
            { note: 'F', duration: 1 }, { note: 'F', duration: 1 },
            { note: 'E', duration: 1 }, { note: 'E', duration: 1 },
            { note: 'D', duration: 1 }, { note: 'D', duration: 1 },
            { note: 'C', duration: 2 },
            // "Up above the world so high"
            { note: 'G', duration: 1 }, { note: 'G', duration: 1 },
            { note: 'F', duration: 1 }, { note: 'F', duration: 1 },
            { note: 'E', duration: 1 }, { note: 'E', duration: 1 },
            { note: 'D', duration: 2 },
            // "Like a diamond in the sky"
            { note: 'G', duration: 1 }, { note: 'G', duration: 1 },
            { note: 'F', duration: 1 }, { note: 'F', duration: 1 },
            { note: 'E', duration: 1 }, { note: 'E', duration: 1 },
            { note: 'D', duration: 2 },
            // "Twinkle twinkle little star"
            { note: 'C', duration: 1 }, { note: 'C', duration: 1 },
            { note: 'G', duration: 1 }, { note: 'G', duration: 1 },
            { note: 'A', duration: 1 }, { note: 'A', duration: 1 },
            { note: 'G', duration: 2 },
            // "How I wonder what you are"
            { note: 'F', duration: 1 }, { note: 'F', duration: 1 },
            { note: 'E', duration: 1 }, { note: 'E', duration: 1 },
            { note: 'D', duration: 1 }, { note: 'D', duration: 1 },
            { note: 'C', duration: 2 },
        ],
    },
    birthday: {
        name: 'Happy Birthday',
        tempo: 100,
        notes: [
            // "Happy birthday to you"
            { note: 'C', duration: 0.75 }, { note: 'C', duration: 0.25 },
            { note: 'D', duration: 1 }, { note: 'C', duration: 1 },
            { note: 'F', duration: 1 }, { note: 'E', duration: 2 },
            // "Happy birthday to you"
            { note: 'C', duration: 0.75 }, { note: 'C', duration: 0.25 },
            { note: 'D', duration: 1 }, { note: 'C', duration: 1 },
            { note: 'G', duration: 1 }, { note: 'F', duration: 2 },
            // "Happy birthday dear [name]"
            { note: 'C', duration: 0.75 }, { note: 'C', duration: 0.25 },
            { note: 'C5', duration: 1 }, { note: 'A', duration: 1 },
            { note: 'F', duration: 1 }, { note: 'E', duration: 1 },
            { note: 'D', duration: 2 },
            // "Happy birthday to you"
            { note: 'A#', duration: 0.75 }, { note: 'A#', duration: 0.25 },
            { note: 'A', duration: 1 }, { note: 'F', duration: 1 },
            { note: 'G', duration: 1 }, { note: 'F', duration: 2 },
        ],
    },
    rowboat: {
        name: 'Row Row Row Your Boat',
        tempo: 120,
        notes: [
            // "Row, row, row your boat"
            { note: 'C', duration: 1 }, { note: 'C', duration: 1 },
            { note: 'C', duration: 0.75 }, { note: 'D', duration: 0.25 },
            { note: 'E', duration: 1 },
            // "Gently down the stream"
            { note: 'E', duration: 0.75 }, { note: 'D', duration: 0.25 },
            { note: 'E', duration: 0.75 }, { note: 'F', duration: 0.25 },
            { note: 'G', duration: 2 },
            // "Merrily merrily merrily merrily"
            { note: 'C5', duration: 0.33 }, { note: 'C5', duration: 0.33 }, { note: 'C5', duration: 0.33 },
            { note: 'G', duration: 0.33 }, { note: 'G', duration: 0.33 }, { note: 'G', duration: 0.33 },
            { note: 'E', duration: 0.33 }, { note: 'E', duration: 0.33 }, { note: 'E', duration: 0.33 },
            { note: 'C', duration: 0.33 }, { note: 'C', duration: 0.33 }, { note: 'C', duration: 0.33 },
            // "Life is but a dream"
            { note: 'G', duration: 0.75 }, { note: 'F', duration: 0.25 },
            { note: 'E', duration: 0.75 }, { note: 'D', duration: 0.25 },
            { note: 'C', duration: 2 },
        ],
    },
};

// Melody playback state
let currentMelody = null;
let melodyTimeouts = [];

const defaultState = {
    // Tone Oscillator
    waveform: 'triangle',
    toneGain: 0.04,
    toneAttack: 0.01,
    toneDecay: 0.08,
    toneSustain: 0.015,
    toneRelease: 0.2,

    // Overtone
    overtoneGain: 0.02,
    overtoneRatio: 2.6,
    overtoneDecay: 0.09,

    // Sub-bass Oscillator
    subBassGain: 0,
    subBassDecay: 0.15,

    // Noise
    noiseAmount: 0.018,
    noiseHighpass: 2500,
    noiseQ: 1.6,
    noiseDecay: 0.045,

    // Filter
    filterEnabled: false,
    filterType: 'lowpass',
    filterCutoff: 2000,
    filterResonance: 1,
    filterEnvAmount: 0,
    filterAttack: 0.01,
    filterDecay: 0.1,
    filterSustain: 0.5,
    filterRelease: 0.2,

    // Effects
    distortionAmount: 0,
    delayEnabled: false,
    delayTime: 0.25,
    delayFeedback: 0.3,
    delayMix: 0.3,
    reverbEnabled: false,
    reverbMix: 0.3,

    // LFO
    lfoEnabled: false,
    lfoRate: 5,
    lfoAmount: 0,
    lfoTarget: 'pitch',

    octaveOffset: 0,
};

// Preset definitions
const presets = {
    default: { ...defaultState, name: 'Default' },
    bell: {
        name: 'Bell',
        waveform: 'sine',
        toneGain: 0.06,
        toneAttack: 0.001,
        toneDecay: 0.3,
        toneSustain: 0.01,
        toneRelease: 0.5,
        overtoneGain: 0.04,
        overtoneRatio: 3.5,
        overtoneDecay: 0.2,
        noiseAmount: 0.005,
        noiseHighpass: 4000,
        noiseQ: 2,
        noiseDecay: 0.02,
        subBassGain: 0,
        filterEnabled: true,
        filterType: 'lowpass',
        filterCutoff: 3000,
        filterResonance: 2,
        filterEnvAmount: 2000,
        filterAttack: 0.001,
        filterDecay: 0.3,
        filterSustain: 0.2,
        filterRelease: 0.5,
        reverbEnabled: true,
        reverbMix: 0.4,
    },
    kick: {
        name: 'Kick Drum',
        waveform: 'sine',
        toneGain: 0.08,
        toneAttack: 0.001,
        toneDecay: 0.15,
        toneSustain: 0,
        toneRelease: 0.05,
        overtoneGain: 0.03,
        overtoneRatio: 1.5,
        overtoneDecay: 0.05,
        noiseAmount: 0.03,
        noiseHighpass: 1000,
        noiseQ: 0.8,
        noiseDecay: 0.03,
        subBassGain: 0.06,
        subBassDecay: 0.2,
        filterEnabled: true,
        filterType: 'lowpass',
        filterCutoff: 150,
        filterResonance: 1,
        filterEnvAmount: 100,
        filterAttack: 0.001,
        filterDecay: 0.1,
        filterSustain: 0,
        filterRelease: 0.05,
        distortionAmount: 20,
    },
    snare: {
        name: 'Snare Drum',
        waveform: 'triangle',
        toneGain: 0.03,
        toneAttack: 0.001,
        toneDecay: 0.08,
        toneSustain: 0.01,
        toneRelease: 0.1,
        overtoneGain: 0.025,
        overtoneRatio: 2.1,
        overtoneDecay: 0.06,
        noiseAmount: 0.04,
        noiseHighpass: 2000,
        noiseQ: 1.2,
        noiseDecay: 0.1,
        subBassGain: 0,
        filterEnabled: true,
        filterType: 'highpass',
        filterCutoff: 200,
        filterResonance: 0.7,
        distortionAmount: 10,
    },
    bass: {
        name: 'Bass',
        waveform: 'sawtooth',
        toneGain: 0.05,
        toneAttack: 0.01,
        toneDecay: 0.1,
        toneSustain: 0.03,
        toneRelease: 0.15,
        overtoneGain: 0.015,
        overtoneRatio: 2,
        overtoneDecay: 0.08,
        noiseAmount: 0.005,
        noiseHighpass: 3000,
        noiseQ: 2,
        noiseDecay: 0.02,
        subBassGain: 0.04,
        subBassDecay: 0.15,
        filterEnabled: true,
        filterType: 'lowpass',
        filterCutoff: 800,
        filterResonance: 3,
        filterEnvAmount: 400,
        filterAttack: 0.01,
        filterDecay: 0.15,
        filterSustain: 0.3,
        filterRelease: 0.2,
        distortionAmount: 15,
    },
    pluck: {
        name: 'Pluck',
        waveform: 'sawtooth',
        toneGain: 0.05,
        toneAttack: 0.001,
        toneDecay: 0.2,
        toneSustain: 0,
        toneRelease: 0.05,
        overtoneGain: 0.03,
        overtoneRatio: 2.5,
        overtoneDecay: 0.15,
        noiseAmount: 0.015,
        noiseHighpass: 3500,
        noiseQ: 1.8,
        noiseDecay: 0.02,
        subBassGain: 0,
        filterEnabled: true,
        filterType: 'lowpass',
        filterCutoff: 1200,
        filterResonance: 2,
        filterEnvAmount: 2000,
        filterAttack: 0.001,
        filterDecay: 0.15,
        filterSustain: 0,
        filterRelease: 0.05,
        delayEnabled: true,
        delayTime: 0.15,
        delayFeedback: 0.2,
        delayMix: 0.2,
    },
};

const state = { ...defaultState };

let audioContext = null;
let reverbNode = null;

document.addEventListener('DOMContentLoaded', () => {
    setupOctaveControls();
    setupSongButtons();
    setupPresetSelector();
    setupExportButton();
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
        button.className = note.isBlack ? 'key key-black' : 'key key-white';
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
            title: 'Sub-Bass',
            description: 'Low-frequency oscillator one octave below the fundamental.',
            controls: [
                { id: 'subBassGain', label: 'Gain', min: 0, max: 0.1, step: 0.001 },
                { id: 'subBassDecay', label: 'Decay (s)', min: 0.05, max: 0.5, step: 0.01 },
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
        {
            title: 'Filter',
            description: 'Tone shaping and envelope control.',
            controls: [
                { id: 'filterEnabled', label: 'Enable', type: 'checkbox' },
                { id: 'filterType', label: 'Type', type: 'select', options: ['lowpass', 'highpass', 'bandpass'] },
                { id: 'filterCutoff', label: 'Cutoff (Hz)', min: 50, max: 5000, step: 10 },
                { id: 'filterResonance', label: 'Resonance (Q)', min: 0.1, max: 20, step: 0.1 },
                { id: 'filterEnvAmount', label: 'Env Amount (Hz)', min: -3000, max: 3000, step: 10 },
                { id: 'filterAttack', label: 'Attack (s)', min: 0.001, max: 0.5, step: 0.001 },
                { id: 'filterDecay', label: 'Decay (s)', min: 0.01, max: 1, step: 0.01 },
                { id: 'filterSustain', label: 'Sustain', min: 0, max: 1, step: 0.01 },
                { id: 'filterRelease', label: 'Release (s)', min: 0.01, max: 1, step: 0.01 },
            ],
        },
        {
            title: 'Distortion',
            description: 'Waveshaping for grit and character.',
            controls: [
                { id: 'distortionAmount', label: 'Amount', min: 0, max: 100, step: 1 },
            ],
        },
        {
            title: 'Delay',
            description: 'Echo effect with feedback.',
            controls: [
                { id: 'delayEnabled', label: 'Enable', type: 'checkbox' },
                { id: 'delayTime', label: 'Time (s)', min: 0.01, max: 1, step: 0.01 },
                { id: 'delayFeedback', label: 'Feedback', min: 0, max: 0.9, step: 0.05 },
                { id: 'delayMix', label: 'Mix', min: 0, max: 1, step: 0.05 },
            ],
        },
        {
            title: 'Reverb',
            description: 'Spatial ambience and room simulation.',
            controls: [
                { id: 'reverbEnabled', label: 'Enable', type: 'checkbox' },
                { id: 'reverbMix', label: 'Mix', min: 0, max: 1, step: 0.05 },
            ],
        },
        {
            title: 'LFO',
            description: 'Low frequency modulation for movement.',
            controls: [
                { id: 'lfoEnabled', label: 'Enable', type: 'checkbox' },
                { id: 'lfoRate', label: 'Rate (Hz)', min: 0.1, max: 20, step: 0.1 },
                { id: 'lfoAmount', label: 'Amount', min: 0, max: 100, step: 1 },
                { id: 'lfoTarget', label: 'Target', type: 'select', options: ['pitch', 'filter', 'gain'] },
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
            } else if (control.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = state[control.id];
                controlEl.classList.add('checkbox-control');
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
                const value = control.type === 'checkbox'
                    ? event.target.checked
                    : control.type === 'select'
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
    if (typeof value === 'boolean') {
        return value ? 'ON' : 'OFF';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (id.includes('Cutoff') || id.includes('Frequency') || id.includes('Highpass') || id.includes('High-pass') || id.includes('EnvAmount') || id.includes('Env Amount')) {
        return `${Math.round(value)} Hz`;
    }

    if (id.toLowerCase().includes('ratio')) {
        return value.toFixed(2);
    }

    if (id.toLowerCase().includes('time') && id.toLowerCase().includes('delay')) {
        return `${value.toFixed(3)} s`;
    }

    if (id.toLowerCase().includes('mix') || id.toLowerCase().includes('feedback') || id.toLowerCase().includes('sustain')) {
        return value.toFixed(2);
    }

    if (id.toLowerCase().includes('gain') || id.toLowerCase().includes('amount') || id.toLowerCase().includes('level')) {
        return value.toFixed(3);
    }

    if (id.toLowerCase().includes('decay') || id.toLowerCase().includes('attack') || id.toLowerCase().includes('release')) {
        return `${value.toFixed(3)} s`;
    }

    if (id.toLowerCase().includes('resonance') || id.toLowerCase().includes('q')) {
        return value.toFixed(2);
    }

    if (id.toLowerCase().includes('rate')) {
        return `${value.toFixed(1)} Hz`;
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

    // Create master gain
    const master = audioContext.createGain();
    master.gain.setValueAtTime(1, now);

    // Apply LFO if enabled
    if (state.lfoEnabled && state.lfoAmount > 0) {
        applyLFO(master, frequency, now);
    }

    // Create audio routing chain
    let destination = master;

    // Add filter if enabled
    let filter = null;
    if (state.filterEnabled) {
        filter = createFilter(frequency, now);
        destination = filter;
    }

    // Add distortion if enabled
    if (state.distortionAmount > 0) {
        const distortion = createDistortion();
        if (filter) {
            filter.connect(distortion);
        } else {
            destination.connect(distortion);
        }
        destination = distortion;
    }

    // Create effects chain
    const effectsChain = createEffectsChain(now);

    // Connect to effects or directly to master
    if (effectsChain) {
        destination.connect(effectsChain.input);
        effectsChain.output.connect(master);
    } else if (filter || state.distortionAmount > 0) {
        destination.connect(master);
    }

    // Connect master to audio context destination
    master.connect(audioContext.destination);

    // Generate sound sources
    const sourceDestination = (filter || (state.distortionAmount > 0)) ? destination : master;
    createToneOscillator(frequency, sourceDestination, now);
    createOvertone(frequency, sourceDestination, now);
    createSubBass(frequency, sourceDestination, now);
    createNoise(sourceDestination, now);

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

function createSubBass(frequency, destination, now) {
    if (state.subBassGain <= 0.0005) {
        return;
    }

    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency / 2, now); // One octave down

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(state.subBassGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + state.subBassDecay);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + state.subBassDecay + 0.05);
}

function createFilter(frequency, now) {
    const filter = audioContext.createBiquadFilter();
    filter.type = state.filterType;
    filter.Q.setValueAtTime(state.filterResonance, now);

    // Set initial cutoff
    const baseCutoff = state.filterCutoff;
    filter.frequency.setValueAtTime(baseCutoff, now);

    // Apply envelope if amount > 0
    if (Math.abs(state.filterEnvAmount) > 1) {
        const targetCutoff = Math.max(50, Math.min(5000, baseCutoff + state.filterEnvAmount));
        const sustainCutoff = baseCutoff + (state.filterEnvAmount * state.filterSustain);

        filter.frequency.linearRampToValueAtTime(targetCutoff, now + state.filterAttack);
        filter.frequency.linearRampToValueAtTime(sustainCutoff, now + state.filterAttack + state.filterDecay);
        filter.frequency.linearRampToValueAtTime(baseCutoff, now + state.filterAttack + state.filterDecay + state.filterRelease);
    }

    return filter;
}

function createDistortion() {
    const distortion = audioContext.createWaveShaper();
    const amount = state.distortionAmount;
    const samples = 256;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    distortion.curve = curve;
    distortion.oversample = '2x';
    return distortion;
}

function createEffectsChain(now) {
    const delayOn = state.delayEnabled && state.delayMix > 0;
    const reverbOn = state.reverbEnabled && state.reverbMix > 0;

    if (!delayOn && !reverbOn) {
        return null;
    }

    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const dryGain = audioContext.createGain();

    let currentNode = input;

    // Add delay
    if (delayOn) {
        const delay = audioContext.createDelay();
        delay.delayTime.setValueAtTime(state.delayTime, now);

        const delayGain = audioContext.createGain();
        delayGain.gain.setValueAtTime(state.delayMix, now);

        const feedback = audioContext.createGain();
        feedback.gain.setValueAtTime(state.delayFeedback, now);

        currentNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(output);
    }

    // Add reverb
    if (reverbOn) {
        ensureReverbNode();
        const reverbGain = audioContext.createGain();
        reverbGain.gain.setValueAtTime(state.reverbMix, now);

        currentNode.connect(reverbNode);
        reverbNode.connect(reverbGain);
        reverbGain.connect(output);
    }

    // Dry signal
    const dryAmount = 1 - Math.max(
        delayOn ? state.delayMix : 0,
        reverbOn ? state.reverbMix : 0
    );
    dryGain.gain.setValueAtTime(dryAmount, now);
    currentNode.connect(dryGain);
    dryGain.connect(output);

    return { input, output };
}

function ensureReverbNode() {
    if (reverbNode) return;

    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.5));
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
    }

    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = impulse;
}

function applyLFO(gainNode, frequency, now) {
    const lfo = audioContext.createOscillator();
    lfo.frequency.setValueAtTime(state.lfoRate, now);

    const lfoGain = audioContext.createGain();
    const amount = state.lfoAmount / 100;

    if (state.lfoTarget === 'gain') {
        lfoGain.gain.setValueAtTime(amount * 0.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
    } else if (state.lfoTarget === 'pitch') {
        lfoGain.gain.setValueAtTime(frequency * amount * 0.1, now);
        // Would need to connect to oscillator frequency - skipping for now
    }

    lfo.start(now);
    lfo.stop(now + 2);
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

function setupPresetSelector() {
    const select = document.getElementById('preset-select');
    if (!select) return;

    select.addEventListener('change', (e) => {
        loadPreset(e.target.value);
    });
}

function loadPreset(presetKey) {
    const preset = presets[presetKey];
    if (!preset) return;

    // Update state with all preset values
    Object.keys(preset).forEach(key => {
        if (key !== 'name' && state.hasOwnProperty(key)) {
            state[key] = preset[key];
        }
    });

    // Update all UI controls
    Object.keys(state).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = state[key];
            } else if (input.tagName === 'SELECT') {
                input.value = state[key];
            } else {
                input.value = state[key];
            }
            updateValueDisplay(key, state[key]);
        }
    });

    updateCodePreview();
}

function setupExportButton() {
    const button = document.getElementById('export-button');
    if (!button) return;

    button.addEventListener('click', () => {
        const definition = buildToneDefinition();
        const json = JSON.stringify(definition, null, 2);

        // Copy to clipboard
        navigator.clipboard.writeText(json).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Export JSON';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback: show in alert
            alert(json);
        });
    });
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

// === Melody Playback System ===

function setupSongButtons() {
    const buttons = [
        { id: 'song-twinkle', melody: 'twinkle' },
        { id: 'song-birthday', melody: 'birthday' },
        { id: 'song-rowboat', melody: 'rowboat' },
    ];

    buttons.forEach(({ id, melody }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => toggleMelody(melody, button));
        }
    });
}

function toggleMelody(melodyKey, button) {
    // If this melody is already playing, stop it
    if (currentMelody === melodyKey) {
        stopMelody();
        return;
    }

    // Stop any currently playing melody
    stopMelody();

    // Start the new melody
    currentMelody = melodyKey;
    updateSongButtonStates();
    playMelody(melodyKey);
}

function stopMelody() {
    // Clear all scheduled timeouts
    melodyTimeouts.forEach(timeout => clearTimeout(timeout));
    melodyTimeouts = [];
    currentMelody = null;
    updateSongButtonStates();
}

function updateSongButtonStates() {
    const buttons = document.querySelectorAll('.song-button');
    buttons.forEach(button => {
        const melodyKey = button.id.replace('song-', '');
        if (currentMelody === melodyKey) {
            button.classList.add('playing');
        } else {
            button.classList.remove('playing');
        }
    });
}

function playMelody(melodyKey) {
    const melody = melodies[melodyKey];
    if (!melody) return;

    const beatDuration = 60000 / melody.tempo; // milliseconds per beat
    let currentTime = 0;

    melody.notes.forEach((noteData, index) => {
        const timeout = setTimeout(() => {
            playMelodyNote(noteData.note);

            // If this is the last note, reset after it finishes
            if (index === melody.notes.length - 1) {
                const noteLength = beatDuration * noteData.duration;
                const resetTimeout = setTimeout(() => {
                    if (currentMelody === melodyKey) {
                        stopMelody();
                    }
                }, noteLength);
                melodyTimeouts.push(resetTimeout);
            }
        }, currentTime);

        melodyTimeouts.push(timeout);
        currentTime += beatDuration * noteData.duration;
    });
}

function playMelodyNote(noteName) {
    // Parse note name (e.g., 'C', 'C5', 'G')
    let noteObj = null;

    // Check if note has octave specified (e.g., 'C5')
    if (noteName.length > 1 && !isNaN(noteName[1])) {
        const name = noteName[0];
        const octave = parseInt(noteName[1]);
        noteObj = notes.find(n => n.name === name && n.baseOctave === octave);
    } else {
        // No octave specified, use base octave 4
        noteObj = notes.find(n => n.name === noteName && n.baseOctave === 4);
    }

    if (noteObj) {
        playNote(noteObj);
        visualizeMelodyNote(noteObj);
    }
}

function visualizeMelodyNote(note) {
    const keyEl = getKeyElement(note);
    if (keyEl) {
        keyEl.classList.add('is-active');
        // Remove visual feedback after a short time
        setTimeout(() => {
            keyEl.classList.remove('is-active');
        }, 200);
    }
}
