import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};

const statusBoxStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem',
  backgroundColor: 'var(--color-surface)',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-secondary)',
};

const metadataCardStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '1.5rem',
  color: 'var(--color-text-secondary)',
};

const metadataListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const metadataItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const metadataLabelStyle = {
  fontWeight: 'bold',
  color: 'var(--color-text)',
};

const preStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '1.5rem',
  fontSize: '1rem',
  lineHeight: '1.7',
  color: 'var(--color-text)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

function ViewPaste() {
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPaste = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/pastes/${id}/view`,
          {}, // POST requests must have a body, even if empty
          { signal: controller.signal }
        );
        setPaste(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          // This is expected when the component unmounts, so we don't set an error
          console.log('Request canceled on component unmount');
        } else {
          console.error('Error fetching paste:', err);
          setError(err.response?.data?.error || 'Could not retrieve paste.');
        }
      } finally {
        // Only set loading to false if the request wasn't canceled
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPaste();

    // Cleanup function: this is called when the component unmounts.
    // In StrictMode, it runs between the first and second render.
    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return <div style={statusBoxStyle}>Loading paste...</div>;
  }

  if (error) {
    return (
      <div style={{...statusBoxStyle, color: 'var(--color-error)'}}>
        This paste could not be found, has expired, or the view limit has been reached.
      </div>
    );
  }

  if (!paste) {
    return null; // Should be covered by loading/error states
  }
  
  // --- Data Formatting for Display ---
  const createdAt = paste.created_at ? new Date(paste.created_at).toLocaleString() : null;
  const expiresAt = paste.expires_at ? new Date(paste.expires_at).toLocaleString() : 'Never';
  const remainingViews = paste.remaining_views !== null ? paste.remaining_views : 'Unlimited';

  return (
    <div style={pageStyle}>
      <h1>Paste Details</h1>
      
      <div style={metadataCardStyle}>
        <ul style={metadataListStyle}>
          <li style={metadataItemStyle}>
            <span style={metadataLabelStyle}>Paste ID:</span>
            <span>{id}</span>
          </li>
          {createdAt && (
            <li style={metadataItemStyle}>
              <span style={metadataLabelStyle}>Created At:</span>
              <span>{createdAt}</span>
            </li>
          )}
          <li style={metadataItemStyle}>
            <span style={metadataLabelStyle}>Expires At:</span>
            <span>{expiresAt}</span>
          </li>
          <li style={metadataItemStyle}>
            <span style={metadataLabelStyle}>Remaining Views:</span>
            <span>{remainingViews}</span>
          </li>
        </ul>
      </div>

      <pre style={preStyle}>
        {paste.content}
      </pre>
    </div>
  );
}

export default ViewPaste;