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
            stopBoxAnimation(element);
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
            stopBoxAnimation(currentlyPlayingElement);
        }

        // Visual feedback
        element.classList.add('playing');
        startBoxAnimation(element);
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
 * Apply typewriter character variations to text content
 */
function applyTypewriterEffect() {
    // Get all text elements to style
    const elementsToStyle = document.querySelectorAll('h1, h2, label, .string');

    elementsToStyle.forEach(element => {
        // Skip if element is empty or only whitespace
        if (!element.textContent.trim()) return;

        // Get the text content
        const text = element.textContent;

        // Clear the element
        element.textContent = '';

        // Wrap each character in a span with random variations
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // For whitespace, just add as text node
            if (char === ' ' || char === '\n' || char === '\t') {
                element.appendChild(document.createTextNode(char));
                continue;
            }

            // Create span for character
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;

            // Add subtle random variations for typewriter effect
            const rotation = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75 degrees
            const offsetY = (Math.random() - 0.5) * 1;
            const letterSpacing = Math.random() * 0.3 - 0.15;
            const opacity = 0.85 + Math.random() * 0.15; // Vary between 0.85 and 1.0

            // Apply transformations
            span.style.transform = `rotate(${rotation}deg) translateY(${offsetY}px)`;
            span.style.letterSpacing = `${letterSpacing}px`;
            span.style.opacity = opacity;

            element.appendChild(span);
        }
    });
}

/**
 * Draw hand-drawn boxes around string elements
 */
function drawStringBoxes() {
    const stringElements = document.querySelectorAll('.string');

    stringElements.forEach(element => {
        drawHandDrawnBox(element);
    });
}

/**
 * Start animating the box at 8fps
 */
function startBoxAnimation(element) {
    // Stop any existing animation
    stopBoxAnimation(element);

    const svg = element.querySelector('.static-box');
    if (!svg) return;

    const path1 = svg.querySelector('path:nth-child(1)');
    const path2 = svg.querySelector('path:nth-child(2)');
    if (!path1 || !path2) return;

    const frames = JSON.parse(element.dataset.boxFrames || '[]');
    if (frames.length === 0) return;

    // Start animation at 8fps (125ms per frame)
    const intervalId = setInterval(() => {
        const currentFrame = parseInt(element.dataset.currentBoxFrame);
        const nextFrame = (currentFrame + 1) % frames.length;
        element.dataset.currentBoxFrame = nextFrame.toString();

        const { box1, box2 } = frames[nextFrame];
        path1.setAttribute('d', box1);
        path2.setAttribute('d', box2);
    }, 125); // 8fps = 1000ms / 8 = 125ms

    element.dataset.boxAnimationInterval = intervalId;
}

/**
 * Stop animating the box and reset to first frame
 */
function stopBoxAnimation(element) {
    const intervalId = element.dataset.boxAnimationInterval;
    if (intervalId) {
        clearInterval(parseInt(intervalId));
        element.dataset.boxAnimationInterval = null;
    }

    // Reset to first frame
    const svg = element.querySelector('.static-box');
    if (!svg) return;

    const path1 = svg.querySelector('path:nth-child(1)');
    const path2 = svg.querySelector('path:nth-child(2)');
    if (!path1 || !path2) return;

    const frames = JSON.parse(element.dataset.boxFrames || '[]');
    if (frames.length > 0) {
        element.dataset.currentBoxFrame = '0';
        const { box1, box2 } = frames[0];
        path1.setAttribute('d', box1);
        path2.setAttribute('d', box2);
    }
}

/**
 * Generate a wobbly hand-drawn line
 */
function generateWobblyLine(x1, y1, x2, y2, segments = 20) {
    let path = `M ${x1},${y1}`;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    for (let i = 1; i <= segments; i++) {
        const x = x1 + dx * i + (Math.random() - 0.5) * 2;
        const y = y1 + dy * i + (Math.random() - 0.5) * 2;
        path += ` L ${x},${y}`;
    }
    return path;
}

/**
 * Generate box path data
 */
function generateBoxPaths(width, height, marginTop, marginBottom, marginLeft, marginRight) {
    const box1 =
        generateWobblyLine(marginLeft, marginTop, width - marginRight, marginTop) + ' ' +
        generateWobblyLine(width - marginRight, marginTop, width - marginRight, height - marginBottom) + ' ' +
        generateWobblyLine(width - marginRight, height - marginBottom, marginLeft, height - marginBottom) + ' ' +
        generateWobblyLine(marginLeft, height - marginBottom, marginLeft, marginTop);

    const offset = 3;
    const box2 =
        generateWobblyLine(marginLeft + offset, marginTop + offset, width - marginRight - offset, marginTop + offset) + ' ' +
        generateWobblyLine(width - marginRight - offset, marginTop + offset, width - marginRight - offset, height - marginBottom - offset) + ' ' +
        generateWobblyLine(width - marginRight - offset, height - marginBottom - offset, marginLeft + offset, height - marginBottom - offset) + ' ' +
        generateWobblyLine(marginLeft + offset, height - marginBottom - offset, marginLeft + offset, marginTop + offset);

    return { box1, box2 };
}

/**
 * Redraw box for an element (called on init and resize)
 */
function redrawBox(element, forceRedraw = false) {
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Skip if dimensions haven't changed (prevents flicker)
    const lastWidth = parseInt(element.dataset.lastBoxWidth || '0');
    const lastHeight = parseInt(element.dataset.lastBoxHeight || '0');

    if (!forceRedraw && width === lastWidth && height === lastHeight) {
        return;
    }

    element.dataset.lastBoxWidth = width.toString();
    element.dataset.lastBoxHeight = height.toString();

    const marginTop = 5;
    const marginBottom = 5;
    const marginLeft = 5;
    const marginRight = 5;

    let svg = element.querySelector('.static-box');
    let path1, path2;

    // Create SVG on first run
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.classList.add('static-box');

        // First box (main outline)
        path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('fill', 'none');
        path1.setAttribute('stroke', '#e8e8e8');
        path1.setAttribute('stroke-width', '1.5');
        path1.setAttribute('opacity', '0.8');

        // Second box (traced outline with offset)
        path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('fill', 'none');
        path2.setAttribute('stroke', '#e8e8e8');
        path2.setAttribute('stroke-width', '1.2');
        path2.setAttribute('opacity', '0.6');

        svg.appendChild(path1);
        svg.appendChild(path2);
        element.appendChild(svg);
        svg.classList.add('ready');
    } else {
        path1 = svg.querySelector('path:nth-child(1)');
        path2 = svg.querySelector('path:nth-child(2)');
    }

    // Update SVG dimensions
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    // Generate and update box paths
    const { box1, box2 } = generateBoxPaths(width, height, marginTop, marginBottom, marginLeft, marginRight);
    path1.setAttribute('d', box1);
    path2.setAttribute('d', box2);

    // Generate animation frames for playing state (6 frames for 8fps animation)
    const frames = [];
    for (let i = 0; i < 6; i++) {
        const framePaths = generateBoxPaths(width, height, marginTop, marginBottom, marginLeft, marginRight);
        frames.push(framePaths);
    }

    // Store frames and animation state on element
    element.dataset.boxFrames = JSON.stringify(frames);

    // Only reset animation state if this is initial draw
    if (!element.dataset.currentBoxFrame) {
        element.dataset.currentBoxFrame = '0';
        element.dataset.boxAnimationInterval = null;
    }
}

/**
 * Draw hand-drawn box around an element
 */
function drawHandDrawnBox(element) {
    redrawBox(element, true);
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

    // Apply typewriter effect to all text
    applyTypewriterEffect();

    // Draw hand-drawn boxes around string elements
    drawStringBoxes();

    // Redraw boxes on window resize
    let boxResizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(boxResizeTimeout);
        boxResizeTimeout = setTimeout(() => {
            const stringElements = document.querySelectorAll('.string');
            stringElements.forEach(element => {
                redrawBox(element);
            });
        }, 50);
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
