/**
 * Guitar Tuner Application
 * Uses Web Audio API to generate guitar string tones
 * Sawtooth wave with lowpass filter simulates guitar timbre
 */

// Constants for audio processing
const FILTER_CUTOFF_FREQ = 2000; // Hz - removes harsh high frequencies
const VOLUME_LEVEL = 0.3; // 30% volume to prevent hearing discomfort

// Standard guitar tuning frequencies (E A D G B E)
const GUITAR_STRINGS = [
    { name: 'E (Lowest)', note: 'E2', freq: 82.41 },
    { name: 'A', note: 'A2', freq: 110.00 },
    { name: 'D', note: 'D3', freq: 146.83 },
    { name: 'G', note: 'G3', freq: 196.00 },
    { name: 'B', note: 'B3', freq: 246.94 },
    { name: 'E (Highest)', note: 'E4', freq: 329.63 }
];

// Global audio context (initialized on first user interaction)
let audioContext = null;

// Track currently playing string for visual feedback
let currentlyPlayingElement = null;

// Track currently playing note to prevent overlapping instances
let currentOscillator = null;
let currentFilter = null;
let currentGainNode = null;
let currentFrequency = null;
let currentAudioStopTimeout = null;

/**
 * Initialize AudioContext with error handling
 * AudioContext must be created after user interaction in modern browsers
 */
function initAudioContext() {
    if (audioContext) {
        return true;
    }

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
    } catch (error) {
        showError('Your browser does not support the Web Audio API. Please try a modern browser like Chrome, Firefox, or Safari.');
        console.error('AudioContext initialization failed:', error);
        return false;
    }
}

/**
 * Stop the currently playing note and clean up audio nodes
 */
function stopCurrentNote() {
    // Cancel any scheduled stop
    if (currentAudioStopTimeout) {
        clearTimeout(currentAudioStopTimeout);
        currentAudioStopTimeout = null;
    }

    // Stop and disconnect audio nodes
    if (currentOscillator) {
        try {
            currentOscillator.stop();
            currentOscillator.disconnect();
        } catch (error) {
            // Oscillator may have already stopped, ignore error
        }
        currentOscillator = null;
    }

    if (currentFilter) {
        currentFilter.disconnect();
        currentFilter = null;
    }

    if (currentGainNode) {
        currentGainNode.disconnect();
        currentGainNode = null;
    }

    currentFrequency = null;
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const container = document.getElementById('guitarStrings');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.insertAdjacentElement('beforebegin', errorDiv);
}

/**
 * Show informational message to user
 * @param {string} message - Info message to display
 */
function showInfo(message) {
    const infoElement = document.getElementById('infoMessage');
    if (infoElement) {
        infoElement.textContent = message;
    }
}

/**
 * Play a tone at specified frequency
 * Note: This function starts the oscillator but doesn't schedule when it stops.
 * The caller must manage stopping it via stopCurrentNote() or scheduling a timeout.
 * @param {number} frequency - Frequency in Hz
 * @returns {Object|null} Object with oscillator and filter/gain nodes, or null if failed
 */
function playTone(frequency) {
    if (!initAudioContext()) {
        return null;
    }

    // Create audio nodes
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Configure oscillator - sawtooth wave sounds more guitar-like
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Configure lowpass filter - removes harsh high frequencies
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(FILTER_CUTOFF_FREQ, audioContext.currentTime);

    // Configure gain - prevents loud/jarring playback
    gainNode.gain.setValueAtTime(VOLUME_LEVEL, audioContext.currentTime);

    // Connect the audio graph: oscillator -> filter -> gain -> speakers
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start playing immediately (no scheduled stop - caller manages this)
    oscillator.start(audioContext.currentTime);

    return { oscillator, filter, gainNode };
}

/**
 * Schedule the stop of audio playback and visual feedback
 * @param {HTMLElement} element - DOM element showing visual feedback
 * @param {number} duration - Duration in seconds before stopping
 */
function scheduleNoteStop(element, duration) {
    // Clear any existing scheduled stop
    if (currentAudioStopTimeout) {
        clearTimeout(currentAudioStopTimeout);
    }

    // Schedule audio and visual cleanup
    currentAudioStopTimeout = setTimeout(() => {
        stopCurrentNote();

        if (currentlyPlayingElement === element) {
            element.classList.remove('playing');
            currentlyPlayingElement = null;
            showInfo('Click or press Enter on a string to play its note');
        }
    }, duration * 1000);
}

/**
 * Handle string interaction (click or keyboard)
 * @param {Object} guitarString - Guitar string data object
 * @param {HTMLElement} element - DOM element that was activated
 */
function handleStringActivation(guitarString, element) {
    // Get selected duration
    const durationSelect = document.getElementById('durationSelect');
    const duration = parseFloat(durationSelect.value);

    // Check if we're clicking the same note that's currently playing
    const isSameNote = currentFrequency === guitarString.freq && currentOscillator;

    if (isSameNote) {
        // Same note - just extend the duration (keeps audio continuous)
        showInfo(`Extending ${guitarString.note} (${guitarString.freq.toFixed(2)} Hz)`);
        scheduleNoteStop(element, duration);
    } else {
        // Different note or no note playing - stop current and start new
        stopCurrentNote();

        // Remove visual feedback from previously playing element
        if (currentlyPlayingElement && currentlyPlayingElement !== element) {
            currentlyPlayingElement.classList.remove('playing');
        }

        // Visual feedback
        element.classList.add('playing');
        currentlyPlayingElement = element;

        // Show info message
        showInfo(`Playing ${guitarString.note} (${guitarString.freq.toFixed(2)} Hz)`);

        // Play the tone and track the oscillator
        const result = playTone(guitarString.freq);
        if (result) {
            currentOscillator = result.oscillator;
            currentFilter = result.filter;
            currentGainNode = result.gainNode;
            currentFrequency = guitarString.freq;
        }

        // Schedule when to stop
        scheduleNoteStop(element, duration);
    }
}

/**
 * Create string UI element with accessibility features
 * @param {Object} guitarString - Guitar string data
 * @returns {HTMLElement} String div element
 */
function createStringElement(guitarString) {
    const stringDiv = document.createElement('div');
    stringDiv.className = 'string';
    stringDiv.innerHTML = `<strong>String:</strong> ${guitarString.name} - <strong>Note:</strong> ${guitarString.note}`;

    // Accessibility attributes
    stringDiv.setAttribute('role', 'button');
    stringDiv.setAttribute('tabindex', '0');
    stringDiv.setAttribute('aria-label', `Play ${guitarString.name} string, note ${guitarString.note}`);

    // Mouse/touch interaction
    stringDiv.addEventListener('click', () => {
        handleStringActivation(guitarString, stringDiv);
    });

    // Keyboard interaction (Enter or Space)
    stringDiv.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // Prevent page scroll on Space
            handleStringActivation(guitarString, stringDiv);
        }
    });

    return stringDiv;
}

/**
 * Handle global keyboard shortcuts for playing strings
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleGlobalKeyboard(event) {
    // Ignore if user is typing in an input or select element
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    // Map of keys to string indices
    const keyMap = {
        'e': 0,  // E (Lowest)
        'a': 1,  // A
        'd': 2,  // D
        'g': 3,  // G
        'b': 4,  // B
        '1': 0,  // String 1: E (Lowest)
        '2': 1,  // String 2: A
        '3': 2,  // String 3: D
        '4': 3,  // String 4: G
        '5': 4,  // String 5: B
        '6': 5   // String 6: E (Highest)
    };

    const key = event.key.toLowerCase();
    const stringIndex = keyMap[key];

    if (stringIndex !== undefined) {
        event.preventDefault(); // Prevent default browser behavior

        const container = document.getElementById('guitarStrings');
        const stringElements = container.querySelectorAll('.string');

        if (stringElements[stringIndex]) {
            handleStringActivation(GUITAR_STRINGS[stringIndex], stringElements[stringIndex]);
        }
    }
}

/**
 * Initialize the application
 */
function init() {
    const container = document.getElementById('guitarStrings');

    // Create string elements
    GUITAR_STRINGS.forEach(guitarString => {
        const stringElement = createStringElement(guitarString);
        container.appendChild(stringElement);
    });

    // Add global keyboard listener for note shortcuts
    document.addEventListener('keydown', handleGlobalKeyboard);

    // Set initial info message
    showInfo('Click, press Enter, or type a note letter (E, A, D, G, B) or number (1-6) to play');

    // Check for Web Audio API support
    if (!window.AudioContext && !window.webkitAudioContext) {
        showError('Your browser does not support the Web Audio API. Please use a modern browser.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
