import React from 'react';
import { Link } from 'react-router-dom';

const headerStyle = {
  padding: '1rem 2rem',
  backgroundColor: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'var(--color-primary)',
  textDecoration: 'none',
};

const navLinkStyle = {
  color: 'var(--color-text)',
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
};

function Header() {
  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        Pastebin-Lite
      </Link>
      <nav>
        <Link to="/" style={navLinkStyle} onMouseEnter={e => e.target.style.backgroundColor = '#2a2a2a'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
          Create New Paste
        </Link>
      </nav>
    </header>
  );
}

export default Header;
