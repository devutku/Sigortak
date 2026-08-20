import React from 'react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <i className="fa-solid fa-car-burst"></i>
          <span>Sigortak</span>
        </div>
        <div className="subtitle-wrapper">
          <span className="subtitle">Araç Yönetim Paneli</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-label">KONTROL PANELİ</div>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('dashboard'); }}
        >
          <i className="fa-solid fa-chart-line"></i> Portföy Genel Özeti (Dashboard)
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'calendar' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('calendar'); }}
        >
          <i className="fa-solid fa-calendar-days"></i> Yenileme & Vade Takvimi
        </a>

        <div className="menu-label">PORTFÖY & MÜŞTERİ YÖNETİMİ</div>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'customers' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('customers'); }}
        >
          <i className="fa-solid fa-users"></i> Müşteri Listesi
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('vehicles'); }}
        >
          <i className="fa-solid fa-car"></i> Kayıtlı Araçlar Portföyü
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'fleet' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('fleet'); }}
        >
          <i className="fa-solid fa-truck-fleet"></i> Kurumsal Filo Yönetimi
        </a>

        <div className="menu-label">SİGORTA & OPERASYON</div>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'policies' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('policies'); }}
        >
          <i className="fa-solid fa-file-contract"></i>  Poliçe Portföyü
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'add-policy' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('add-policy'); }}
        >
          <i className="fa-solid fa-file-import"></i> Poliçe İçe Aktarma
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'workorders' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('workorders'); }}
        >
          <i className="fa-solid fa-car-burst"></i> Hasar & Dosya Takibi
        </a>

        <div className="menu-label">SATIŞ & FİNANS</div>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'quotes' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('quotes'); }}
        >
          <i className="fa-solid fa-tags"></i> Teklifler & Karşılaştırmalar
        </a>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'billing' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('billing'); }}
        >
          <i className="fa-solid fa-credit-card"></i> Komisyon & Prim / Fatura Takibi
        </a>

        <div className="menu-label">OTOMASYON</div>
        <a
          href="#"
          className={`menu-item ${activeMenu === 'reminders' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveMenu('reminders'); }}
        >
          <i className="fa-solid fa-envelope-open-text"></i> Otomatik Vade Hatırlatıcıları
        </a>
      </nav>

    </aside>
  );
};
