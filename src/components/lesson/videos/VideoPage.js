import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sequence = location.state?.sequence || [];
  const materialIndex = location.state?.materialIndex || 0;

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/material/video/view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setVideo(response.data);
      } catch (error) {
        console.error("Failed to fetch video metadata:", error);
        setError("Unable to load video.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, user.token]);

  const goToNext = () => {
    const nextIndex = materialIndex + 1;
    if (nextIndex < sequence.length) {
      navigate(`/learning/flow/${nextIndex}`, {
        state: { sequence },
      });
    } else {
      alert("Tahniah! Anda telah melengkapkan topik ini.");
      navigate("/learning-materials");
    }
  };

  if (loading) return <div style={styles.loading}>Loading video...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!video) return <div style={styles.error}>Video not found.</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Sebelumnya</button>
      <h2 style={styles.title}>{video.videoTitle || "Untitled Video"}</h2>
      <video
        style={styles.video}
        controls
        preload="metadata"
        src={`http://localhost:8080/material/video/stream/${video.idVideo}`}
      >
        Your browser does not support the video tag.
      </video>
      {video.videoDescription && (
        <p style={styles.description}>{video.videoDescription}</p>
      )}
      <button onClick={goToNext} style={styles.nextButton}>
        Seterusnya →
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  backButton: {
    marginBottom: '10px',
    backgroundColor: '#eee',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  nextButton: {
    marginTop: '20px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  description: {
    marginTop: '15px',
    fontSize: '16px',
    color: '#555',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
  },
  error: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: 'red',
  },
};

export default VideoPage;
