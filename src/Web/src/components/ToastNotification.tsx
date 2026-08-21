import React from 'react';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onClose
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#ecfdf5';
      case 'error': return '#fef2f2';
      case 'info':
      default: return '#eff6ff';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success': return '#065f46';
      case 'error': return '#991b1b';
      case 'info':
      default: return '#1e40af';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#a7f3d0';
      case 'error': return '#fca5a5';
      case 'info':
      default: return '#bfdbfe';
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'success': return 'fa-circle-check';
      case 'error': return 'fa-circle-xmark';
      case 'info':
      default: return 'fa-circle-info';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: getBackgroundColor(),
      color: getTextColor(),
      border: `1px solid ${getBorderColor()}`,
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '320px',
      maxWidth: '450px'
    }}>
      <i className={`fa-solid ${getIconClass()}`} style={{ fontSize: '20px' }}></i>
      <div style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>{message}</div>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
