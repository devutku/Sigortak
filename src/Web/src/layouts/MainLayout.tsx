import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  activeMenu: string;
  setActiveMenu: (menu: any) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeMenu, setActiveMenu, handleLogout, children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const getMenuLabel = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Kontrol Paneli';
      case 'calendar': return 'Takvim / Yaklaşanlar';
      case 'customers': return 'Müşteriler';
      case 'vehicles': return 'Araçlarım';
      case 'policies': return 'Poliçeler (Kasko / Trafik)';
      case 'inspections': return 'Araç Muayeneleri';
      case 'fleet': return 'Filo Yönetimi';
      case 'workorders': return 'Hasar & Kaza Kayıtları';
      case 'reminders': return 'Hatırlatmalar';
      case 'quotes': return 'Teklifler';
      case 'billing': return 'Fatura / Ödemeler';
      default: return 'Araç Yönetimi';
    }
  };

  const getSubMenuLabel = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Genel Durum Analizi';
      case 'calendar': return 'Hatırlatma ve Muayene Takvimi';
      case 'customers': return 'Aktif Müşteri Listesi';
      case 'vehicles': return 'Tüm Araçlarınız';
      case 'policies': return 'Aktif Kasko ve Trafik Poliçeleri';
      case 'inspections': return 'Araç Muayene Takip ve Geçmişi';
      case 'fleet': return 'Filo Durumu ve Analizi';
      case 'workorders': return 'Hasar Dosyaları ve İş Takibi';
      case 'reminders': return 'Otomasyon ve Gönderim Raporları';
      case 'quotes': return 'Sigorta Karşılaştırma Ekranı';
      case 'billing': return 'Ödemeler ve Faturalar';
      default: return 'Sigortak';
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="main-content">
        <header className="header">
          <div className="breadcrumb">
            <i className="fa-solid fa-sidebar-toggle sidebar-trigger"></i>
            <span>{getMenuLabel()}</span>
            <i className="fa-solid fa-chevron-right separator"></i>
            <span className="active">{getSubMenuLabel()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="notification-bell">
              <i className="fa-regular fa-bell"></i>
              <span className="badge"></span>
            </div>
            <div 
              className="user-profile" 
              onClick={() => setShowDropdown(!showDropdown)} 
              ref={dropdownRef}
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'background-color 0.2s' }}
            >
              <div className="avatar">A</div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>Yönetici</span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px', color: '#64748b', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '160px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '6px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontWeight: 600,
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '4px',
                    textAlign: 'left'
                  }}>
                    HESAP YÖNETİMİ
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div style={{ padding: '30px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
