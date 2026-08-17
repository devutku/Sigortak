import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  activeMenu: string;
  setActiveMenu: (menu: any) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeMenu, setActiveMenu, handleLogout, children }) => {
  const getMenuLabel = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Kontrol Paneli';
      case 'calendar': return 'Takvim / Yaklasanlar';
      case 'customers': return 'Müsteriler';
      case 'vehicles': return 'Araclarim';
      case 'policies': return 'Policeler (Kasko / Trafik)';
      case 'inspections': return 'Arac Muayeneleri';
      case 'fleet': return 'Filo Yönetimi';
      case 'workorders': return 'Hasar & Kaza Kayitlari';
      case 'reminders': return 'Hatirlatmalar';
      case 'quotes': return 'Teklifler';
      case 'billing': return 'Fatura / Ödemeler';
      default: return 'Arac Yönetimi';
    }
  };

  const getSubMenuLabel = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Genel Durum Analizi';
      case 'calendar': return 'Hatirlatma ve Muayene Takvimi';
      case 'customers': return 'Aktif Müsteri Listesi';
      case 'vehicles': return 'Tüm Araclariniz';
      case 'policies': return 'Aktif Kasko ve Trafik Policeleri';
      case 'inspections': return 'Arac Muayene Takip ve Gecmisi';
      case 'fleet': return 'Filo Durumu ve Analizi';
      case 'workorders': return 'Hasar Dosyalari ve Is Takibi';
      case 'reminders': return 'Otomasyon ve Gönderim Raporlari';
      case 'quotes': return 'Sigorta Karsilastirma Ekrani';
      case 'billing': return 'Ödemeler ve Faturalar';
      default: return 'Sigortak';
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} handleLogout={handleLogout} />
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
            <div className="user-profile">
              <div className="avatar">A</div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>Yönetici</span>
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
