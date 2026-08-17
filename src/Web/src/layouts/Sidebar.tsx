import React from 'react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: any) => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu, handleLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <i className="fa-solid fa-car-burst"></i>
          <span>Sigortak</span>
        </div>
        <div className="subtitle-wrapper">
          <span className="subtitle">Arac Yönetim Paneli</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-label">KONTROL PANELİ</div>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('dashboard'); }}
        >
          <i className="fa-solid fa-chart-line"></i> Kontrol Paneli
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'calendar' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('calendar'); }}
        >
          <i className="fa-solid fa-calendar-days"></i> Takvim / Yaklasanlar
        </a>

        <div className="menu-label">MÜŞTERİLER</div>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'customers' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('customers'); }}
        >
          <i className="fa-solid fa-users"></i> Müşteri Listesi
        </a>

        <div className="menu-label">SİGORTA & ARAC YÖNETİMİ</div>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('vehicles'); }}
        >
          <i className="fa-solid fa-car"></i> Araclarim
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'policies' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('policies'); }}
        >
          <i className="fa-solid fa-file-contract"></i> Policeler (Kasko / Trafik)
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'inspections' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('inspections'); }}
        >
          <i className="fa-solid fa-file-shield"></i> Arac Muayeneleri
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'fleet' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('fleet'); }}
        >
          <i className="fa-solid fa-sliders"></i> Filo Yönetimi
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'workorders' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('workorders'); }}
        >
          <i className="fa-solid fa-file-invoice"></i> Hasar & Kaza Kayitlari
        </a>

        <div className="menu-label">OTOMASYON & BİLDİRİM</div>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'reminders' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('reminders'); }}
        >
          <i className="fa-solid fa-bell"></i> Hatirlatmalar
        </a>

        <div className="menu-label">FİNANS & İŞLEMLER</div>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'quotes' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('quotes'); }}
        >
          <i className="fa-solid fa-receipt"></i> Teklifler
        </a>
        <a 
          href="#" 
          className={`menu-item ${activeMenu === 'billing' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('billing'); }}
        >
          <i className="fa-solid fa-credit-card"></i> Fatura / Ödemeler
        </a>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <a 
          href="#" 
          className="menu-item" 
          onClick={(e) => { e.preventDefault(); handleLogout(); }}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
        >
          <i className="fa-solid fa-right-from-bracket" style={{ color: '#ef4444' }}></i> Cikis Yap
        </a>
      </div>
    </aside>
  );
};
