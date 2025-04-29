import React, { useRef, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DEFAULT_TRACKS = [
  // Example: { name: "Sample.mp3", url: process.env.PUBLIC_URL + "/tracks/sample.mp3" }
  // You can place your static mp3s in public/tracks/
];

const STORAGE_KEY = "audioplayer_session";

function App() {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const [durations, setDurations] = useState({});
  const audioRef = useRef();

  // Restore session
  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setTracks(parsed.tracks || DEFAULT_TRACKS);
        setCurrentTrack(parsed.currentTrack || null);
        setPlaybackRate(parsed.playbackRate || 1);
        setTimeout(() => {
          if (audioRef.current && parsed.audioTime) {
            audioRef.current.currentTime = parsed.audioTime;
          }
        }, 200);
      } catch {}
    }
  }, []);

  // Persist session
  useEffect(() => {
    const audioTime = audioRef.current ? audioRef.current.currentTime : 0;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tracks,
        currentTrack,
        playbackRate,
        audioTime,
      })
    );
  }, [tracks, currentTrack, playbackRate]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const uploadedTracks = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setTracks((prev) => [...prev, ...uploadedTracks]);
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Handle duration load
  const handleLoadedMetadata = (url, e) => {
    const duration = e.target.duration;
    setDurations((prev) => ({ ...prev, [url]: duration }));
  };

  // Delete track with password
  const handleDeleteTrack = (track) => {
    const pw = prompt("Enter password to delete track:");
    if (pw === "superadmin") {
      setTracks((prev) => prev.filter((t) => t.url !== track.url));
      setDurations((prev) => {
        const d = { ...prev };
        delete d[track.url];
        return d;
      });
      if (currentTrack && currentTrack.url === track.url) {
        setCurrentTrack(null);
      }
    } else if (pw !== null) {
      alert("Incorrect password");
    }
  };

  // Sort
  const sortTracks = (asc = true) => {
    setTracks((prev) =>
      [...prev].sort((a, b) =>
        asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      )
    );
    setSortAsc(asc);
  };

  // Drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tracks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTracks(reordered);
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

  // Auto-play next track
  const handleEnded = () => {
    if (!currentTrack) return;
    const idx = tracks.findIndex((t) => t.url === currentTrack.url);
    if (idx !== -1 && idx < tracks.length - 1) {
      setCurrentTrack(tracks[idx + 1]);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play();
        }
      }, 0);
    }
    // If last track, do nothing (stop)
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
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => sortTracks(true)} disabled={sortAsc} style={{ marginRight: 4 }}>Sort A–Z</button>
        <button onClick={() => sortTracks(false)} disabled={!sortAsc}>Sort Z–A</button>
      </div>
      <div>
        <h4>Tracks:</h4>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tracks">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps}>
                {tracks.length === 0 && <li>No tracks available. Upload mp3 files!</li>}
                {tracks.map((track, idx) => (
  <Draggable key={track.url} draggableId={track.url} index={idx}>
    {(provided, snapshot) => (
      <li
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          marginBottom: 4,
          background: snapshot.isDragging ? "#e0e0e0" : undefined,
          ...provided.draggableProps.style,
        }}
      >
        <button
          style={{ marginRight: 8 }}
          onClick={() => handleTrackSelect(track)}
          disabled={currentTrack && currentTrack.url === track.url}
        >
          {currentTrack && currentTrack.url === track.url ? "Playing" : "Play"}
        </button>
        {track.name}
        <span style={{ marginLeft: 8, color: '#888', fontSize: '0.9em' }}>
          {durations[track.url] ? formatDuration(durations[track.url]) : <>
            <audio
              src={track.url}
              style={{ display: 'none' }}
              preload="metadata"
              onLoadedMetadata={(e) => handleLoadedMetadata(track.url, e)}
            />
            --:--
          </>}
        </span>
        <button
          style={{ marginLeft: 8, color: 'red' }}
          onClick={() => handleDeleteTrack(track)}
        >
          Delete
        </button>
      </li>
    )}
  </Draggable>
))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <div style={{ marginTop: 24 }}>
        {currentTrack && (
          <div>
            <audio
              ref={audioRef}
              controls
              style={{ width: "100%" }}
              onEnded={handleEnded}
              onRateChange={(e) => setPlaybackRate(e.target.playbackRate)}
              onTimeUpdate={() => {
                // Save position on every update
                const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify({
                    ...session,
                    audioTime: audioRef.current ? audioRef.current.currentTime : 0,
                  })
                );
              }}
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
