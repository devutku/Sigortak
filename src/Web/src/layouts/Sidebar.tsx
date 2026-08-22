import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <i className="fa-solid fa-car-burst"></i>
          <span>Sigortak</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-label">KONTROL PANELİ</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-chart-line"></i> Portföy Genel Özeti (Dashboard)
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-calendar-days"></i> Yenileme & Vade Takvimi
        </NavLink>

        <div className="menu-label">PORTFÖY & MÜŞTERİ YÖNETİMİ</div>
        <NavLink
          to="/customers"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-users"></i> Müşteri Listesi
        </NavLink>
        <NavLink
          to="/vehicles"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-car"></i> Kayıtlı Araçlar Portföyü
        </NavLink>
        <NavLink
          to="/fleet"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-truck-fleet"></i> Kurumsal Filo Yönetimi
        </NavLink>

        <div className="menu-label">SİGORTA & OPERASYON</div>
        <NavLink
          to="/policies"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-file-contract"></i>  Poliçe Portföyü
        </NavLink>
        <NavLink
          to="/add-policy"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-file-import"></i> Poliçe İçe Aktarma
        </NavLink>
        <NavLink
          to="/workorders"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-car-burst"></i> Hasar & Dosya Takibi
        </NavLink>

        <div className="menu-label">SATIŞ & FİNANS</div>
        <NavLink
          to="/quotes"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-tags"></i> Teklifler & Karşılaştırmalar
        </NavLink>
        <NavLink
          to="/billing"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-credit-card"></i> Komisyon & Prim / Fatura Takibi
        </NavLink>

        <div className="menu-label">OTOMASYON</div>
        <NavLink
          to="/reminders"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="fa-solid fa-envelope-open-text"></i> Otomatik Vade Hatırlatıcıları
        </NavLink>
      </nav>

    </aside>
  );
};
