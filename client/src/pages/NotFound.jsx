import React from 'react';

const statusBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem',
  backgroundColor: 'var(--color-surface)',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  textAlign: 'center',
  gap: '1rem',
};

const headingStyle = {
    margin: 0,
    fontSize: '2rem',
    color: 'var(--color-error)'
};

const textStyle = {
    margin: 0,
    color: 'var(--color-text-secondary)'
};

function NotFound() {
  return (
    <div style={statusBoxStyle}>
      <h2 style={headingStyle}>404 - Not Found</h2>
      <p style={textStyle}>The page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFound;