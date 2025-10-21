# MyTuner

A simple, accessible guitar tuner web app that plays reference tones for each guitar string in standard tuning.

## Features

- **Interactive UI** - Click or use keyboard (Enter/Space) to play tones for standard guitar tuning
- **Adjustable Duration** - Control how long each tone plays (1-10 seconds)
- **Realistic Guitar Tone** - Uses sawtooth waveform with lowpass filter to simulate guitar timbre
- **Accessible** - Full keyboard navigation support with ARIA labels for screen readers
- **Visual Feedback** - Clear indication when a note is playing
- **Safe Volume** - Pre-configured to 30% volume to prevent hearing discomfort
- **Responsive Design** - Works on desktop and mobile devices

## Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mreedthings/mytuner.git
   cd mytuner
   ```

2. **Open in Browser**

   Simply open `index.html` in your web browser:
   - Double-click the file, or
   - Use a local server: `python -m http.server 8000` (Python 3)
   - Or use any other local development server

## Usage

1. **Select Duration** - Choose how long you want the tone to play (1-10 seconds)
2. **Play a Note** - Click on a guitar string or use Tab + Enter/Space for keyboard navigation
3. **Visual Feedback** - The selected string will highlight and show a musical note icon while playing
4. **Tune Your Guitar** - Match your guitar string to the reference tone

**Keyboard Controls:**
- `Tab` - Navigate between strings
- `Enter` or `Space` - Play the focused string

## Technical Details

### Standard Guitar Tuning (E A D G B E)
| String | Note | Frequency |
|--------|------|-----------|
| 6 (Lowest) | E2 | 82.41 Hz |
| 5 | A2 | 110.00 Hz |
| 4 | D3 | 146.83 Hz |
| 3 | G3 | 196.00 Hz |
| 2 | B3 | 246.94 Hz |
| 1 (Highest) | E4 | 329.63 Hz |

### Audio Processing
- **Waveform**: Sawtooth oscillator (richer harmonic content than sine wave)
- **Filter**: Lowpass filter at 2000 Hz (removes harsh high frequencies)
- **Volume**: Fixed at 30% to prevent hearing discomfort

## Browser Compatibility

Requires a modern browser with Web Audio API support:
- Chrome/Edge 35+
- Firefox 25+
- Safari 14.1+
- Opera 22+

**Not supported**: Internet Explorer

## Code Quality Improvements

Recent improvements include:
- Volume control via GainNode to prevent loud playback
- Memory leak prevention with proper node cleanup
- Error handling for unsupported browsers
- Full keyboard accessibility with ARIA labels
- Visual feedback during playback
- Input validation for duration selection
- Comprehensive JSDoc comments
- Mobile-responsive design

## Contribution

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
