import React from 'react';

const AdPlaceholder = ({ style }) => {
  const defaultStyle = {
    background: '#f0f0f0', // Light gray background
    border: '2px dashed #ccc', // Dashed border
    color: '#888', // Gray text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    minHeight: '90px', // Common ad height
    margin: '16px 0',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <div style={combinedStyle}>
      {/* 나중에 이 div를 구글 애드센스 코드로 교체하세요. */}
      <p>광고 영역 (Ad Placeholder)</p>
    </div>
  );
};

export default AdPlaceholder;
