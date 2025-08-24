import { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ apiUrl = 'http://localhost:5001' }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    if (videoRef.current) {
      videoRef.current.load(); // Reload the video element
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="video-player-container">
      <style jsx>{`
        .video-player-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .controls {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .btn:hover {
          background: #0051cc;
        }
        
        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          text-align: center;
        }
        
        .success {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          text-align: center;
        }
        
        .video-container {
          text-align: center;
          margin: 20px 0;
        }
        
        .video-player {
          max-width: 100%;
          width: 800px;
          height: 450px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: #000;
        }
        
        .video-list {
          margin: 20px 0;
        }
        
        .video-item {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .video-item:hover {
          border-color: #0070f3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .video-item.selected {
          border-color: #0070f3;
          background: #e3f2fd;
        }
        
        .video-info {
          flex-grow: 1;
          text-align: left;
        }
        
        .video-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .video-details {
          font-size: 14px;
          color: #666;
        }
        
        .video-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn-small {
          padding: 5px 10px;
          font-size: 14px;
        }
        
        .loading {
          text-align: center;
          padding: 20px;
          font-size: 16px;
        }
        
        .no-videos {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .current-video {
          background: #e8f5e8;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          text-align: center;
        }
      `}</style>

      <div className="header">
        <h1>Video Streaming Player</h1>
        <p>Stream videos from your Express.js server</p>
      </div>

      <div className="controls">
        <button 
          className="btn" 
          onClick={fetchVideos} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Videos'}
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {selectedVideo && (
        <div className="current-video">
          <strong>Now Playing:</strong> {selectedVideo.name}
        </div>
      )}

      <div className="video-container">
        <video 
          ref={videoRef}
          className="video-player" 
          controls 
          preload="metadata"
        >
          {selectedVideo && (
            <source 
              src={${apiUrl}/stream/${encodeURIComponent(selectedVideo.name)}}
              type="video/mp4" 
            />
          )}
          Your browser does not support the video tag.
        </video>
        
        {!selectedVideo && (
          <div className="no-videos">
            <p>Select a video from the list below to start streaming</p>
          </div>
        )}
      </div>

      <div className="video-list">
        <h3>Available Videos ({videos.length})</h3>
        
        {loading && (
          <div className="loading">Loading videos...</div>
        )}
        
        {!loading && videos.length === 0 && !error && (
          <div className="no-videos">
            No videos found. Make sure your server is running and has videos in the /video directory.
          </div>
        )}
        
        {videos.map((video, index) => (
          <div 
            key={index} 
            className={video-item ${selectedVideo?.name === video.name ? 'selected' : ''}}
          >
            <div className="video-info">
              <div className="video-name">{video.name}</div>
              <div className="video-details">
                Size: {formatFileSize(video.size)} | 
                Modified: {new Date(video.modified).toLocaleDateString()}
              </div>
            </div>
            <div className="video-actions">
              <button 
                className="btn btn-small" 
                onClick={() => selectVideo(video)}
              >
                {selectedVideo?.name === video.name ? 'Playing' : 'Play'}
              </button>
              <button 
                className="btn btn-small" 
                onClick={() => window.open(${apiUrl}/download/${encodeURIComponent(video.name)}, '_blank')}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;