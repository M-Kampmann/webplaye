import React, { useRef, useState } from "react";

const DEFAULT_TRACKS = [
  // Example: { name: "Sample.mp3", url: process.env.PUBLIC_URL + "/tracks/sample.mp3" }
  // You can place your static mp3s in public/tracks/
];

function App() {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef();

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const uploadedTracks = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setTracks((prev) => [...prev, ...uploadedTracks]);
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play();
      }
    }, 0);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Simple Audio Player</h2>
      <input
        type="file"
        accept="audio/mp3"
        multiple
        onChange={handleUpload}
        style={{ marginBottom: 16 }}
      />
      <div>
        <h4>Tracks:</h4>
        <ul>
          {tracks.length === 0 && <li>No tracks available. Upload mp3 files!</li>}
          {tracks.map((track, idx) => (
            <li key={track.url} style={{ marginBottom: 4 }}>
              <button
                style={{ marginRight: 8 }}
                onClick={() => handleTrackSelect(track)}
                disabled={currentTrack && currentTrack.url === track.url}
              >
                {currentTrack && currentTrack.url === track.url ? "Playing" : "Play"}
              </button>
              {track.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 24 }}>
        {currentTrack && (
          <div>
            <audio
              ref={audioRef}
              controls
              style={{ width: "100%" }}
              onRateChange={(e) => setPlaybackRate(e.target.playbackRate)}
            >
              <source src={currentTrack.url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <div style={{ marginTop: 8 }}>
              <label>Playback speed: </label>
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(Number(e.target.value))}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>{rate}x</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
