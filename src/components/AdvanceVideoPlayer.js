import { useState, useRef, useEffect } from 'react';

const AdvancedVideoPlayer = ({ apiUrl = 'http://localhost:5001' }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);

  // Fetch available videos from the API
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(${apiUrl}/videos);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.videos);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      setError(Connection error: ${err.message});
    } finally {
      setLoading(false);
    }
  };

  // Load video for streaming
  const selectVideo = (video) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Control functions
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.target.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="advanced-video-player">
      <style jsx>{`
        .advanced-video-player {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .player-container {
          background: #000;
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .video-wrapper {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }
        
        .video-element {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .custom-controls {
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          color: white;
        }
        
        .progress-container {
          margin-bottom: 15px;
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: #0070f3;
          border-radius: 3px;
          transition: width 0.1s ease;
        }
        
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }
        
        .left-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .right-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .control-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 3px;
          transition: background 0.2s;
        }
        
        .control-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .time-display {
          font-size: 14px;
          min-width: 100px;
        }
        
        .volume-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .volume-slider {
          width: 80px;
        }
        
        .speed-select {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .video-info {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .playlist {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .playlist-item {
          display: flex;
          align-items: center;
          padding: 10px;
          margin: 5px 0;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .playlist-item:hover {
          background: #f8f9fa;
        }
        
        .playlist-item.active {
          background: #e3f2fd;
          border-color: #0070f3;
        }
        
        .thumbnail {
          width: 60px;
          height: 40px;
          background: #ddd;
          border-radius: 4px;
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #666;
        }
        
        .video-details {
          flex-grow: 1;
        }
        
        .video-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .video-meta {
          font-size: 12px;
          color: #666;
        }
        
        .no-video-placeholder {
          background: #333;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          min-height: 400px;
        }
        
        .header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn:hover {
          background: #0051cc;
        }
        
        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          text-align: center;
        }
      `}</style>

      <div className="header-controls">
        <h2>🎬 Advanced Video Player</h2>
        <button className="btn" onClick={fetchVideos} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Videos'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="player-container">
        <div className="video-wrapper">
          {selectedVideo ? (
            <>
              <video
                ref={videoRef}
                className="video-element"
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                preload="metadata"
              >
                <source 
                  src={${apiUrl}/stream/${encodeURIComponent(selectedVideo.name)}}
                  type="video/mp4" 
                />
              </video>
              
              <div className="custom-controls">
                <div className="progress-container">
                  <div className="progress-bar" onClick={handleSeek}>
                    <div 
                      className="progress-fill" 
                      style={{ width: ${(currentTime / duration) * 100}% }}
                    />
                  </div>
                </div>
                
                <div className="controls-row">
                  <div className="left-controls">
                    <button className="control-btn" onClick={togglePlayPause}>
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    
                    <div className="time-display">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  
                  <div className="right-controls">
                    <div className="volume-container">
                      <span>🔊</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                      />
                    </div>
                    
                    <select 
                      value={playbackRate} 
                      onChange={handlePlaybackRateChange}
                      className="speed-select"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-video-placeholder">
              Select a video to start streaming
            </div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <div className="video-info">
          <h3>Now Playing: {selectedVideo.name}</h3>
          <p>Size: {formatFileSize(selectedVideo.size)} | Modified: {new Date(selectedVideo.modified).toLocaleDateString()}</p>
        </div>
      )}

      <div className="playlist">
        <h3>Playlist ({videos.length} videos)</h3>
        
        {videos.map((video, index) => (
          <div 
            key={index}
            className={playlist-item ${selectedVideo?.name === video.name ? 'active' : ''}}
            onClick={() => selectVideo(video)}
          >
            <div className="thumbnail">
              🎬
            </div>
            <div className="video-details">
              <div className="video-title">{video.name}</div>
              <div className="video-meta">
                {formatFileSize(video.size)} • {new Date(video.modified).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        
        {videos.length === 0 && !loading && (
          <p>No videos available. Add videos to your server's /video directory.</p>
        )}
      </div>
    </div>
  );
};

export default AdvancedVideoPlayer;