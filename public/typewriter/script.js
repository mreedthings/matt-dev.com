const page = document.getElementById('page');
let content = [];
let cursorPosition = 0; // Tracks where we are in the content array
let indicatorTimeout = null; // Track the indicator removal timeout
let indicatorShakeTimeoutId = null;
const INDICATOR_SHAKE_DURATION = 1000; // ms

// Audio context for sound generation
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Generate typewriter key press sound
function playKeySound() {
    const now = audioContext.currentTime;

    // Create a gentle "shh" sound using white noise
    const bufferSize = audioContext.sampleRate * 0.08; // 80ms of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // High-pass filter for gentle "shh" quality
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000 + Math.random() * 1000, now);
    filter.Q.setValueAtTime(0.5, now);

    // Very gentle, quick fade
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.08);
}

// Generate spacebar sound (currently muted)
function playSpaceSound() {}

// Generate carriage return bell sound
function playEnterSound() {
    const now = audioContext.currentTime;

    // A7 bell note
    const fundamental = 3520.00;
    const partials = [
        { freq: fundamental, gain: 1.0 },      // Fundamental
        { freq: fundamental * 2.4, gain: 0.6 }, // First overtone
        { freq: fundamental * 3.2, gain: 0.4 }, // Second overtone
        { freq: fundamental * 4.5, gain: 0.25 } // Third overtone
    ];

    const masterGain = audioContext.createGain();

    // Create a subtle vibrato (LFO) for waviness
    const vibrato = audioContext.createOscillator();
    const vibratoGain = audioContext.createGain();

    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(4, now); // 4Hz wobble
    vibratoGain.gain.setValueAtTime(3, now); // Very subtle pitch modulation (±3Hz)

    vibrato.connect(vibratoGain);
    vibrato.start(now);
    vibrato.stop(now + 1.2);

    // Create oscillators for each partial
    partials.forEach(partial => {
        const osc = audioContext.createOscillator();
        const partialGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(partial.freq, now);

        // Connect vibrato to frequency for waviness
        vibratoGain.connect(osc.frequency);

        // Each partial has its own decay rate - quieter volume
        const initialGain = 0.025 * partial.gain; // Reduced from 0.04 to 0.025
        partialGain.gain.setValueAtTime(initialGain, now);
        // Quick initial drop, then very gradual tail that fades imperceptibly
        partialGain.gain.exponentialRampToValueAtTime(0.006, now + 0.08); // Fast drop to 25% volume
        partialGain.gain.exponentialRampToValueAtTime(0.003, now + 0.5); // Gradual fade
        partialGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // Very slow final fade to silence

        osc.connect(partialGain);
        partialGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.2);
    });

    masterGain.connect(audioContext.destination);
}

// Gentle boundary knock when backspace cannot move further left
function playBoundarySound() {
    const now = audioContext.currentTime;
    const boundaryFrequency = 73.416; // D2
    const tone = {
        waveform: 'triangle',
        gain: 0.04,
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.015, release: 0.2 },
    };
    const overtone = { gain: 0.02, ratio: 2.6, decay: 0.09 };
    const noise = { amount: 0.018, highpassFrequency: 2500, q: 1.6, decay: 0.045 };

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(1, now);
    masterGain.connect(audioContext.destination);

    // Primary tone
    const toneOsc = audioContext.createOscillator();
    toneOsc.type = tone.waveform;
    toneOsc.frequency.setValueAtTime(boundaryFrequency, now);

    const toneGain = audioContext.createGain();
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.linearRampToValueAtTime(tone.gain, now + tone.envelope.attack);
    toneGain.gain.linearRampToValueAtTime(
        Math.max(tone.envelope.sustain, 0.0001),
        now + tone.envelope.attack + tone.envelope.decay
    );
    toneGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + tone.envelope.attack + tone.envelope.decay + tone.envelope.release
    );

    toneOsc.connect(toneGain);
    toneGain.connect(masterGain);

    const toneStop =
        now + tone.envelope.attack + tone.envelope.decay + tone.envelope.release + 0.05;
    toneOsc.start(now);
    toneOsc.stop(toneStop);

    // Overtone for articulation
    if (overtone.gain > 0.0005) {
        const overtoneOsc = audioContext.createOscillator();
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(boundaryFrequency * overtone.ratio, now);

        const overtoneGain = audioContext.createGain();
        overtoneGain.gain.setValueAtTime(overtone.gain, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + overtone.decay);

        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(masterGain);

        overtoneOsc.start(now);
        overtoneOsc.stop(now + overtone.decay + 0.05);
    }

    // Breath of filtered noise
    if (noise.amount > 0.0005) {
        const duration = noise.decay;
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
        filter.frequency.setValueAtTime(noise.highpassFrequency, now);
        filter.Q.setValueAtTime(noise.q, now);

        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(noise.amount, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        source.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        source.start(now);
        source.stop(now + duration);
    }
}

function scheduleIndicatorShake(targetChar) {
    if (!targetChar) return;

    const expiresAt = performance.now() + INDICATOR_SHAKE_DURATION;
    targetChar.shakeUntil = expiresAt;

    if (indicatorShakeTimeoutId) {
        clearTimeout(indicatorShakeTimeoutId);
    }

    indicatorShakeTimeoutId = setTimeout(() => {
        indicatorShakeTimeoutId = null;
        render();
    }, INDICATOR_SHAKE_DURATION);
}

// Focus on the page immediately
page.setAttribute('tabindex', '0');
page.focus();

// Prevent default behavior and handle all keyboard input
page.addEventListener('keydown', (e) => {
    e.preventDefault();

    const key = e.key;

    if (key === 'Backspace') {
        // Move cursor back one position, but not past line boundaries
        if (cursorPosition > 0) {
            // Find the start of the current line
            let lineStart = cursorPosition - 1;
            while (lineStart >= 0 && content[lineStart].value !== '\n') {
                lineStart--;
            }
            lineStart++; // Move past the newline (or to 0 if no newline found)

            // Only move back if we're not at the start of the line
            if (cursorPosition > lineStart) {
                cursorPosition--;

                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });

                // Clear any existing timeout
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Mark this position for cursor indicator
                if (content[cursorPosition]) {
                    content[cursorPosition].showIndicator = true;
                }
            } else {
                // We're at the start of the line - show indicator at first character
                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });

                // Clear any existing timeout
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // If there's already a character at lineStart, show indicator on it
                // Otherwise, create a temporary character to show the indicator
                let indicatorChar = null;
                if (content[lineStart] && !content[lineStart].isTemporary) {
                    content[lineStart].showIndicator = true;
                    indicatorChar = content[lineStart];
                } else if (content[lineStart] && content[lineStart].isTemporary) {
                    // Already have a temporary character, just ensure it shows indicator
                    content[lineStart].showIndicator = true;
                    indicatorChar = content[lineStart];
                } else {
                    // No character at this position - add temporary indicator character
                    content.splice(lineStart, 0, {
                        value: ' ',
                        overlays: [],
                        rotation: 0,
                        offsetY: 0,
                        letterSpacing: 0,
                        showIndicator: true,
                        isTemporary: true
                    });
                    indicatorChar = content[lineStart] || content[0] || null;
                }

                scheduleIndicatorShake(indicatorChar || content[lineStart] || content[0] || null);
                playBoundarySound();
            }
        } else {
            // cursorPosition is 0 - we're at the very beginning
            // Add a temporary character with indicator to show we can't go back
            if (content.length === 0) {
                // Empty page - add temporary indicator character
                content.push({
                    value: ' ',
                    overlays: [],
                    rotation: 0,
                    offsetY: 0,
                    letterSpacing: 0,
                    showIndicator: true,
                    isTemporary: true
                });
                scheduleIndicatorShake(content[0]);
            } else if (content[0]) {
                // Show indicator at first character
                content[0].showIndicator = true;
                scheduleIndicatorShake(content[0]);
            }

            playBoundarySound();
        }
    } else if (key.length === 1) {
        // Printable character
        const isSpace = key === ' ';
        if (isSpace) {
            playSpaceSound();
        } else {
            playKeySound();
        }

        // Check if typing consecutive spaces or space at start of line
        const prevChar = cursorPosition > 0 ? content[cursorPosition - 1] : null;
        const currentChar = cursorPosition < content.length ? content[cursorPosition] : null;

        // Check if previous character is a space (original or overlay)
        const prevIsSpace = prevChar && (
            prevChar.value === ' ' ||
            (prevChar.overlays && prevChar.overlays.length > 0 && prevChar.overlays[prevChar.overlays.length - 1] === ' ')
        );

        // Check if current position (where we're about to type) is a space
        const currentIsSpace = currentChar && (
            currentChar.value === ' ' ||
            (currentChar.overlays && currentChar.overlays.length > 0 && currentChar.overlays[currentChar.overlays.length - 1] === ' ')
        );

        // Check if we're at the start of a line (previous character is newline or we're at position 0)
        const isStartOfLine = cursorPosition === 0 || (prevChar && prevChar.value === '\n');

        const isConsecutiveSpace = isSpace && (prevIsSpace || currentIsSpace);
        const isSpaceAtLineStart = isSpace && isStartOfLine;

        // Clear any cursor indicators when typing (unless consecutive spaces or space at line start)
        if (!isConsecutiveSpace && !isSpaceAtLineStart) {
            content.forEach(char => {
                if (char.showIndicator) {
                    char.showIndicator = false;
                }
            });
            if (indicatorTimeout) {
                clearTimeout(indicatorTimeout);
                indicatorTimeout = null;
            }
        }

        if (cursorPosition < content.length) {
            // We're overlaying on an existing character
            const targetChar = content[cursorPosition];

            // If we're typing over a temporary character, replace it instead of overlaying
            if (targetChar.isTemporary) {
                targetChar.value = key;
                targetChar.isTemporary = false;
                targetChar.showIndicator = false;
                // Add random variations
                targetChar.rotation = (Math.random() - 0.5) * 1.5;
                targetChar.offsetY = (Math.random() - 0.5) * 1;
                targetChar.letterSpacing = Math.random() * 0.3 - 0.15;
                targetChar.opacity = 0.85 + Math.random() * 0.15; // Vary between 0.85 and 1.0
                cursorPosition++;
            } else {
                // Normal overlay behavior
                if (!targetChar.overlays) {
                    targetChar.overlays = [];
                }
                targetChar.overlays.push(key);
                cursorPosition++;
            }

            // Show indicator for consecutive spaces or space at line start in overlay mode
            if (isConsecutiveSpace || isSpaceAtLineStart) {
                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Show indicator at the next position (where next character will appear)
                if (cursorPosition < content.length) {
                    // There's already a character at the next position
                    content[cursorPosition].showIndicator = true;
                } else {
                    // At the end - add temporary character for indicator
                    content.push({
                        value: ' ',
                        overlays: [],
                        rotation: 0,
                        offsetY: 0,
                        letterSpacing: 0,
                        showIndicator: true,
                        isTemporary: true
                    });
                }
            }
        } else {
            // We're at the end, add a new character
            // Add subtle random variations for typewriter effect
            const rotation = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75 degrees
            const offsetY = (Math.random() - 0.5) * 1; // -0.5 to +0.5 pixels
            const letterSpacing = Math.random() * 0.3 - 0.15; // -0.15 to +0.15 pixels
            const opacity = 0.85 + Math.random() * 0.15; // Vary between 0.85 and 1.0

            content.push({
                value: key,
                overlays: [],
                rotation,
                offsetY,
                letterSpacing,
                opacity
            });
            cursorPosition++;

            // Show indicator for consecutive spaces or space at line start
            if (isConsecutiveSpace || isSpaceAtLineStart) {
                // Clear all previous indicators
                content.forEach(char => {
                    if (char.showIndicator) {
                        char.showIndicator = false;
                    }
                });
                if (indicatorTimeout) {
                    clearTimeout(indicatorTimeout);
                    indicatorTimeout = null;
                }

                // Show indicator at the next position (where next character will appear)
                // Add temporary character for indicator since we're at the end
                content.push({
                    value: ' ',
                    overlays: [],
                    rotation: 0,
                    offsetY: 0,
                    letterSpacing: 0,
                    showIndicator: true,
                    isTemporary: true
                });
            }
        }
    } else if (key === 'Enter') {
        // Carriage return - like a real typewriter, go to next line but leave existing text
        playEnterSound();

        // Clear all previous indicators
        content.forEach(char => {
            if (char.showIndicator) {
                char.showIndicator = false;
            }
        });
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
            indicatorTimeout = null;
        }

        // Find the end of the current line
        let lineEnd = cursorPosition;
        while (lineEnd < content.length && content[lineEnd].value !== '\n') {
            lineEnd++;
        }

        // Always add newline at the end of the current line, not at cursor position
        if (lineEnd < content.length && content[lineEnd].value === '\n') {
            // Line already has a newline, position cursor after it
            cursorPosition = lineEnd + 1;
        } else {
            // Add newline at end of current line
            content.splice(lineEnd, 0, { value: '\n', overlays: [] });
            cursorPosition = lineEnd + 1;
        }

        // Show indicator at the start of the new line
        if (cursorPosition === content.length) {
            // At the end, add a temporary placeholder for the indicator
            content.push({
                value: ' ',
                overlays: [],
                rotation: 0,
                offsetY: 0,
                letterSpacing: 0,
                showIndicator: true,
                isTemporary: true
            });
        } else if (content[cursorPosition]) {
            // Show indicator at current position
            content[cursorPosition].showIndicator = true;
        }
    }

    render();
});

// Keep focus on the page
page.addEventListener('blur', () => {
    setTimeout(() => page.focus(), 0);
});

function render() {
    page.innerHTML = '';
    const now = performance.now();

    content.forEach((char, index) => {
        if (char.value === '\n') {
            page.appendChild(document.createTextNode('\n'));
        } else {
            const span = document.createElement('span');
            span.className = 'char';

            // For temporary indicator characters, use invisible text
            if (char.isTemporary) {
                span.style.color = 'transparent';
                span.style.pointerEvents = 'none';
                span.textContent = char.value;
            } else {
                span.textContent = char.value;
            }

            // Apply subtle random transformations
            if (char.rotation !== undefined) {
                span.style.transform = `rotate(${char.rotation}deg) translateY(${char.offsetY}px)`;
                span.style.letterSpacing = `${char.letterSpacing}px`;
            }

            // Apply subtle random opacity variation
            if (char.opacity !== undefined) {
                span.style.opacity = char.opacity;
            }

            // Show cursor indicator if needed
            if (char.showIndicator) {
                span.classList.add('cursor-indicator', 'fade-out');

                if (char.shakeUntil) {
                    if (char.shakeUntil > now) {
                        span.classList.add('shake');
                    } else {
                        char.shakeUntil = null;
                    }
                }

                // Set timeout to remove the indicator after animation completes
                // Only set if we don't already have one (prevents multiple timeouts)
                if (!indicatorTimeout) {
                    indicatorTimeout = setTimeout(() => {
                        char.showIndicator = false;
                        char.shakeUntil = null;

                        // Remove temporary characters when indicator disappears
                        if (char.isTemporary) {
                            const tempIndex = content.indexOf(char);
                            if (tempIndex !== -1) {
                                content.splice(tempIndex, 1);
                                // Adjust cursor position if needed
                                if (cursorPosition > tempIndex) {
                                    cursorPosition--;
                                }
                            }
                        }

                        indicatorTimeout = null;
                        render();
                    }, 1300); // 1s delay + 0.3s animation
                }
            }

            // Add overlaid characters
            if (char.overlays && char.overlays.length > 0) {
                char.overlays.forEach(overlayChar => {
                    const overlay = document.createElement('span');
                    overlay.className = 'overlay';
                    overlay.textContent = overlayChar;
                    span.appendChild(overlay);
                });
            }

            page.appendChild(span);
        }
    });
}
