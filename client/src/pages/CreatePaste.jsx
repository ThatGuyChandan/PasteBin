import React, { useState } from 'react';
import axios from 'axios';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  color: 'var(--color-text-secondary)',
};

const inputStyle = {
  padding: '0.8rem',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  color: 'var(--color-text)',
  fontSize: '1rem',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '200px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const buttonStyle = {
  alignSelf: 'flex-start',
  backgroundColor: 'var(--color-primary)',
  color: '#000000',
  fontWeight: 'bold',
};

const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontWeight: 'normal',
    borderColor: 'var(--color-border)',
    borderWidth: '1px',
    borderStyle: 'solid',
};

const errorStyle = {
  color: 'var(--color-error)',
  backgroundColor: 'rgba(207, 102, 121, 0.1)',
  padding: '1rem',
  borderRadius: '4px',
  border: '1px solid var(--color-error)',
};

const successBoxStyle = {
    marginTop: '20px',
    padding: '1.5rem',
    backgroundColor: 'rgba(102, 187, 106, 0.1)',
    border: '1px solid var(--color-success)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
};

function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [error, setError] = useState('');
  const [shareableUrl, setShareableUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Failed to copy URL: ', err);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShareableUrl('');

    if (!content.trim()) {
      setError('Paste content cannot be empty.');
      return;
    }

    const pasteData = { content };

    if (ttlSeconds !== '') {
      const parsedTtl = parseInt(ttlSeconds, 10);
      if (isNaN(parsedTtl) || parsedTtl <= 0) {
        setError('Time to live (seconds) must be a positive number.');
        return;
      }
      pasteData.ttl_seconds = parsedTtl;
    }

    if (maxViews !== '') {
      const parsedMaxViews = parseInt(maxViews, 10);
      if (isNaN(parsedMaxViews) || parsedMaxViews <= 0) {
        setError('Maximum views must be a positive number.');
        return;
      }
      pasteData.max_views = parsedMaxViews;
    }

    try {
      const response = await axios.post(`/api/pastes`, pasteData);
      setShareableUrl(response.data.url);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      console.error('Error creating paste:', err);
      setError(err.response?.data?.error || 'Failed to create paste. Please try again.');
    }
  };

  if (shareableUrl) {
    return (
      <div style={successBoxStyle}>
        <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '1.2rem' }}>Paste Created!</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" readOnly value={shareableUrl} style={{...inputStyle, flex: 1, backgroundColor: 'transparent' }} />
            <button onClick={handleCopy} style={secondaryButtonStyle}>
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setShareableUrl('')} style={{...buttonStyle}}>
            Create Another Paste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1>Create New Paste</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="content" style={labelStyle}>Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your paste here..."
            style={textareaStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="ttlSeconds" style={labelStyle}>Time to Live (seconds, optional)</label>
          <input
            type="number"
            id="ttlSeconds"
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value)}
            placeholder="e.g., 3600 for 1 hour"
            min="1"
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="maxViews" style={labelStyle}>Maximum Views (optional)</label>
          <input
            type="number"
            id="maxViews"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            placeholder="e.g., 5 for 5 views"
            min="1"
            style={inputStyle}
          />
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        
        <button type="submit" style={buttonStyle}>
          Create Paste
        </button>
      </form>
    </div>
  );
}

export default CreatePaste;