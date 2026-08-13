import React, { useState, useEffect } from 'react';
import './App.css';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  ownerId: string;
  ownerName?: string;
  bodyType: string;
  engineNumber?: string;
  engineCapacity?: string;
  chassisNumber?: string;
  registrationNumber?: string;
  inspectionDate?: string;
  insuranceEndDate?: string;
  inspectionRemainingDays?: number;
  inspectionStatus?: string;
  insuranceRemainingDays?: number;
  insuranceStatus?: string;
  policyId?: string;
  policyNumber?: string;
  policyStartDate?: string;
  policyEndDate?: string;
  policyPremium?: number;
  policyDocumentUrl?: string;
}

const GATEWAY_URL = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation & filtering states matching Web_old
  const [activeMenu, setActiveMenu] = useState<'vehicles' | 'dashboard' | 'add-policy'>('vehicles');
  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Vehicle Form State
  const [vfPlate, setVfPlate] = useState("");
  const [vfBrand, setVfBrand] = useState("");
  const [vfModel, setVfModel] = useState("");
  const [vfYear, setVfYear] = useState("");
  const [vfEngineCapacity, setVfEngineCapacity] = useState("");
  const [vfChassisNumber, setVfChassisNumber] = useState("");
  const [vfRegistrationNumber, setVfRegistrationNumber] = useState("");
  const [vfOwnerName, setVfOwnerName] = useState("");
  const [vfBodyType, setVfBodyType] = useState("Sedan");
  const [vfSuccess, setVfSuccess] = useState("");
  const [vfError, setVfError] = useState("");
  const [vfSubmitting, setVfSubmitting] = useState(false);

  // Policy Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [premium, setPremium] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Renewal Form State
  const [renewVehicleId, setRenewVehicleId] = useState("");
  const [renewPolicyNo, setRenewPolicyNo] = useState("");
  const [renewPremium, setRenewPremium] = useState("");

  // Load FontAwesome and fetch vehicles
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(link);

    if (token) {
      fetchVehicles();
    }

    return () => {
      document.head.removeChild(link);
    };
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Giriş başarısız. Lütfen şifrenizi kontrol edin.");
      }
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      setToken(data.data.accessToken);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setVehicles([]);
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/vehicles`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok && data.data) {
        setVehicles(data.data);
      }
    } catch (err) {
      console.error("Araçlar yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!selectedVehicleId || !policyNumber || !startDate || !endDate || !premium) {
      setFormError("Lütfen tüm alanları doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("policyNumber", policyNumber);
      formData.append("vehicleId", selectedVehicleId);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("premium", premium);
      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      const res = await fetch(`${GATEWAY_URL}/api/v1/policies`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Poliçe oluşturulamadı.");
      }

      setFormSuccess("Poliçe başarıyla tanımlandı!");
      setPolicyNumber("");
      setSelectedVehicleId("");
      setStartDate("");
      setEndDate("");
      setPremium("");
      setPdfFile(null);

      fetchVehicles();
      setTimeout(() => {
        setIsPolicyModalOpen(false);
        setFormSuccess("");
      }, 1500);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!renewVehicleId || !renewPolicyNo || !renewPremium) {
      setFormError("Lütfen alanları doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("vehicleId", renewVehicleId);
      formData.append("policyNumber", renewPolicyNo);
      formData.append("startDate", new Date().toISOString().split('T')[0]);
      formData.append("endDate", new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      formData.append("premium", renewPremium);

      const res = await fetch(`${GATEWAY_URL}/api/v1/policies/renew`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Poliçe yenilenemedi.");
      }

      alert("Poliçe başarıyla yenilendi!");
      setIsRenewModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVfError("");
    setVfSuccess("");
    if (!vfPlate || !vfBrand || !vfModel || !vfYear || !vfOwnerName) {
      setVfError("Lütfen zorunlu alanları doldurun (Plaka, Marka, Model, Yıl, Araç Sahibi).");
      return;
    }

    setVfSubmitting(true);
    try {
      const payload = {
        plate: vfPlate.toUpperCase(),
        brand: vfBrand,
        model: vfModel,
        year: parseInt(vfYear),
        engineCapacity: vfEngineCapacity,
        engineNumber: "",
        chassisNumber: vfChassisNumber,
        registrationNumber: vfRegistrationNumber,
        ownerId: "00000000-0000-0000-0000-000000000000",
        ownerName: vfOwnerName,
        bodyType: ["Sedan","OffRoad","Hatchback","Pickup","Van","Sport","Micro","Convertible","Crossover","SUV","Wagon","Muscle","Roadster","Cabriolet","Limousine","Formula1"].indexOf(vfBodyType) + 1
      };

      const res = await fetch(`${GATEWAY_URL}/api/v1/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Araç oluşturulamadı.");
      }

      setVfSuccess("Araç başarıyla eklendi! Liste güncelleniyor...");
      // Reset form
      setVfPlate(""); setVfBrand(""); setVfModel(""); setVfYear("");
      setVfEngineCapacity(""); setVfChassisNumber(""); setVfRegistrationNumber("");
      setVfOwnerName(""); setVfBodyType("Sedan");

      // Give backend time to process the async RabbitMQ command
      setTimeout(() => {
        fetchVehicles();
        setIsVehicleModalOpen(false);
        setVfSuccess("");
      }, 2000);
    } catch (err: any) {
      setVfError(err.message);
    } finally {
      setVfSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="badge badge-zamanin-var" style={{ background: '#e2e8f0', color: '#64748b' }}>BELİRSİZ</span>;
    if (status === 'ZAMANIN VAR' || status === 'MUAYENE ZAMANIN VAR') {
      return <span className="badge badge-zamanin-var">ZAMANIN VAR</span>;
    }
    if (status === 'MUAYENE DOLMAK ÜZERE' || status === 'SİGORTA DOLMAK ÜZERE') {
      return <span className="badge badge-dolmak-uzere">DOLMAK ÜZERE</span>;
    }
    return <span className="badge badge-doldu">DOLDU</span>;
  };

  // Render Login Page
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <i className="fa-solid fa-car-burst"></i>
              <span>Sigortak</span>
            </div>
            <p>Güvenli Araç ve Muayene Takip Sistemi</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Kullanıcı adınızı girin" 
              />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn btn-login">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
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
          <div className="menu-label">Ana Menü</div>
          <a 
            href="#" 
            className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveMenu('dashboard'); }}
          >
            <i className="fa-solid fa-chart-line"></i> Kontrol Paneli
          </a>

          <div className="menu-label">Müşteriler</div>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
            <i className="fa-solid fa-users"></i> Müşteriler
          </a>

          <div className="menu-label">Servis</div>
          <a 
            href="#" 
            className={`menu-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveMenu('vehicles'); }}
          >
            <i className="fa-solid fa-car"></i> Araçlarım
          </a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-sliders"></i> Filo Yönetimi</a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-bell"></i> Hatırlatmalar</a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-file-invoice"></i> İş Emirleri</a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-file-shield"></i> Araç Muayenelerim</a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-calendar-days"></i> Takvim</a>

          <div className="menu-label">İşlemler</div>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-receipt"></i> Teklifler</a>
          <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-credit-card"></i> Fatura</a>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <a 
            href="#" 
            className="menu-item" 
            onClick={(e) => { e.preventDefault(); handleLogout(); }}
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ color: '#ef4444' }}></i> Çıkış Yap
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="breadcrumb">
            <i className="fa-solid fa-sidebar-toggle sidebar-trigger"></i>
            <span>Araçlarım</span>
            <i className="fa-solid fa-chevron-right separator"></i>
            <span className="active">Tüm Araçlar</span>
          </div>

          <div className="header-right">
            <div className="rates">
              <div className="rate-item">
                <span className="rate-label">$ USD</span>
                <span className="rate-value">₺47.78 <i className="fa-solid fa-caret-up text-success"></i></span>
              </div>
              <div className="rate-item">
                <span className="rate-label">€ EUR</span>
                <span className="rate-value">₺55.11 <i className="fa-solid fa-caret-up text-success"></i></span>
              </div>
            </div>

            <div className="global-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Ara... (Ctrl+K)" />
            </div>

            <button className="btn btn-primary" onClick={() => setIsPolicyModalOpen(true)}>+ Ekle</button>
          </div>
        </header>

        {/* Dashboard View */}
        {activeMenu === 'dashboard' && (
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-deep-twilight)' }}>Kontrol Paneli Özeti</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Toplam Araç</div>
                <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--color-deep-twilight)' }}>{vehicles.length}</div>
              </div>
              <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Aktif Poliçeler</div>
                <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--color-bright-teal)' }}>{vehicles.filter(v => v.policyId).length}</div>
              </div>
              <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Bitişi Yaklaşan</div>
                <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: '#854d0e' }}>
                  {vehicles.filter(v => v.insuranceStatus === 'DOLMAK ÜZERE' || v.insuranceStatus === 'SİGORTA DOLMAK ÜZERE').length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles View */}
        {activeMenu === 'vehicles' && (
          <>
            <section className="action-bar">
              <div className="filter-tabs">
                <button 
                  className={`tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('active')}
                >
                  Aktif
                </button>
                <button 
                  className={`tab-btn ${activeFilter === 'archived' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('archived')}
                >
                  Arşivlenmiş
                </button>
              </div>

              <div className="search-and-buttons">
                <div className="search-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    placeholder="Plaka, marka, model, Şase No ile ara..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="view-modes">
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="fa-solid fa-list"></i>
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fa-solid fa-grip"></i>
                  </button>
                </div>

                <button className="btn btn-primary" onClick={() => setIsVehicleModalOpen(true)}>
                  <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>Yeni Araç Ekle
                </button>
              </div>
            </section>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
            ) : viewMode === 'list' ? (
              // List layout matching Web_old
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plaka</th>
                      <th>Araç Bilgisi</th>
                      <th>Muayene Kalan Gün</th>
                      <th>Muayene Durumu</th>
                      <th>Sigorta Durumu</th>
                      <th>Kasa Tipi</th>
                      <th style={{ textAlign: 'right' }}>Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(v => (
                      <tr key={v.id}>
                        <td>
                          <div className="plate-badge">{v.plate}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.year} {v.brand} {v.model}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Şase No: {v.ownerId.slice(0, 10)}...</div>
                        </td>
                        <td>
                          {v.inspectionRemainingDays !== undefined ? `${v.inspectionRemainingDays} gün` : '- gün'}
                        </td>
                        <td>
                          {getStatusBadge(v.inspectionStatus)}
                        </td>
                        <td>
                          {getStatusBadge(v.insuranceStatus)}
                        </td>
                        <td>
                          {v.bodyType || 'Sedan'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {v.policyId ? (
                              <>
                                {v.policyDocumentUrl && (
                                  <a 
                                    href={`${GATEWAY_URL}${v.policyDocumentUrl}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px 10px', fontSize: '12px', background: '#f1f5f9' }}
                                  >
                                    <i className="fa-solid fa-file-pdf"></i> PDF
                                  </a>
                                )}
                                <button 
                                  onClick={() => {
                                    setRenewVehicleId(v.id);
                                    setRenewPolicyNo(v.policyNumber + "-R");
                                    setIsRenewModalOpen(true);
                                  }}
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 10px', fontSize: '12px' }}
                                >
                                  <i className="fa-solid fa-arrows-rotate"></i> Yenile
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedVehicleId(v.id);
                                  setIsPolicyModalOpen(true);
                                }}
                                className="btn btn-primary" 
                                style={{ padding: '6px 10px', fontSize: '12px' }}
                              >
                                + Poliçe Ekle
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid Card layout
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {filteredVehicles.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => setDetailVehicle(v)}
                    style={{
                      padding: '20px',
                      background: '#fff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,119,182,0.12)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-bright-teal)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div className="plate-badge">{v.plate}</div>
                      {getStatusBadge(v.insuranceStatus)}
                    </div>

                    {/* Vehicle Info */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '4px' }}>
                      {v.year} {v.brand} {v.model}
                    </h3>
                    {v.ownerName && (
                      <div style={{ fontSize: '12px', color: '#0077b6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-user" style={{ fontSize: '10px' }}></i>{v.ownerName}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '12px', marginBottom: '14px' }}>
                      <span><i className="fa-solid fa-car-side" style={{ marginRight: '4px' }}></i>{v.bodyType || 'Sedan'}</span>
                      {v.engineCapacity && (
                        <span><i className="fa-solid fa-gauge-high" style={{ marginRight: '4px' }}></i>{v.engineCapacity}L</span>
                      )}
                      {v.inspectionRemainingDays !== undefined && (
                        <span><i className="fa-solid fa-clipboard-check" style={{ marginRight: '4px' }}></i>{v.inspectionRemainingDays} gün</span>
                      )}
                    </div>

                    {/* Policy mini summary */}
                    {v.policyId ? (
                      <div style={{ background: 'var(--badge-zamanin-var-bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.policyNumber}</div>
                          <div style={{ color: '#64748b', marginTop: '2px' }}>{v.insuranceRemainingDays} gün kaldı</div>
                        </div>
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: '20px', color: 'var(--color-bright-teal)' }}></i>
                      </div>
                    ) : (
                      <div style={{ background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#991b1b', fontWeight: 500 }}>Aktif poliçe yok</span>
                        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '16px', color: '#dc2626' }}></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Define Policy Modal */}
      {isPolicyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Yeni Poliçe Tanımla</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsPolicyModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePolicy} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
                  {formSuccess}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Araç Seçin</label>
                <select 
                  className="form-input" 
                  value={selectedVehicleId} 
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  style={{ background: '#fff', color: '#1e293b' }}
                  required
                >
                  <option value="">Araç Seçin...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Poliçe Numarası</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={policyNumber} 
                  onChange={e => setPolicyNumber(e.target.value)} 
                  placeholder="Örn: POL-987654"
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Başlangıç Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bitiş Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Prim Tutarı (TL)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={premium} 
                  onChange={e => setPremium(e.target.value)} 
                  placeholder="Örn: 12500"
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poliçe Belgesi (PDF)</label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="form-input" 
                  style={{ background: '#fff', color: '#1e293b' }}
                  onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={submitting}>
                {submitting ? "Kaydediliyor..." : "Poliçeyi Kaydet ve Yayınla"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Renew Policy Modal */}
      {isRenewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Poliçe Yenile</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsRenewModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={submitRenewal} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Yeni Poliçe Numarası</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={renewPolicyNo} 
                  onChange={e => setRenewPolicyNo(e.target.value)} 
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yeni Prim Tutarı (TL)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={renewPremium} 
                  onChange={e => setRenewPremium(e.target.value)} 
                  placeholder="Örn: 15000"
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                Poliçeyi Yenile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {detailVehicle && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 94, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setDetailVehicle(null)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div style={{ background: 'var(--color-deep-twilight)', color: '#fff', padding: '24px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="plate-badge" style={{ background: '#fff', color: 'var(--color-deep-twilight)', fontSize: '14px', padding: '6px 14px', marginBottom: '12px' }}>{detailVehicle.plate}</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{detailVehicle.year} {detailVehicle.brand} {detailVehicle.model}</h2>
                <p style={{ color: 'var(--color-frosted-blue)', fontSize: '13px', marginTop: '6px' }}>
                  <i className="fa-solid fa-user" style={{ marginRight: '4px' }}></i>
                  {detailVehicle.ownerName || 'Bilinmiyor'} &bull; {detailVehicle.bodyType}
                </p>
              </div>
              <button 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setDetailVehicle(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Detail Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Vehicle Technical Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {detailVehicle.engineCapacity && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motor</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginTop: '2px' }}>{detailVehicle.engineCapacity} L</div>
                  </div>
                )}
                {detailVehicle.chassisNumber && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Şasi No</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px', wordBreak: 'break-all' }}>{detailVehicle.chassisNumber}</div>
                  </div>
                )}
                {detailVehicle.registrationNumber && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruhsat No</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px' }}>{detailVehicle.registrationNumber}</div>
                  </div>
                )}
              </div>

              {/* Status Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--color-bright-teal)' }}></i>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Muayene Durumu</span>
                  </div>
                  {getStatusBadge(detailVehicle.inspectionStatus)}
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                    {detailVehicle.inspectionRemainingDays !== undefined ? `${detailVehicle.inspectionRemainingDays} gün kaldı` : 'Bilgi yok'}
                  </div>
                  {detailVehicle.inspectionDate && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Son Muayene: {new Date(detailVehicle.inspectionDate).toLocaleDateString('tr-TR')}</div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-bright-teal)' }}></i>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sigorta Durumu</span>
                  </div>
                  {getStatusBadge(detailVehicle.insuranceStatus)}
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                    {detailVehicle.insuranceRemainingDays !== undefined ? `${detailVehicle.insuranceRemainingDays} gün kaldı` : 'Bilgi yok'}
                  </div>
                  {detailVehicle.insuranceEndDate && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Bitiş: {new Date(detailVehicle.insuranceEndDate).toLocaleDateString('tr-TR')}</div>
                  )}
                </div>
              </div>

              {/* Policy Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-file-contract" style={{ color: 'var(--color-bright-teal)' }}></i>
                  Poliçe Bilgileri
                </h3>

                {detailVehicle.policyId ? (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', width: '40%', borderBottom: '1px solid var(--border-color)' }}>Poliçe No</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-deep-twilight)', borderBottom: '1px solid var(--border-color)' }}>{detailVehicle.policyNumber}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>Başlangıç Tarihi</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{detailVehicle.policyStartDate ? new Date(detailVehicle.policyStartDate).toLocaleDateString('tr-TR') : '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>Bitiş Tarihi</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{detailVehicle.policyEndDate ? new Date(detailVehicle.policyEndDate).toLocaleDateString('tr-TR') : '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b' }}>Prim Tutarı</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-bright-teal)' }}>{detailVehicle.policyPremium?.toLocaleString('tr-TR')} ₺</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ border: '1px dashed #e2e8f0', borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                    Bu araca henüz bir poliçe tanımlanmamıştır.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {detailVehicle.policyId ? (
                  <>
                    {detailVehicle.policyDocumentUrl && (
                      <a
                        href={`${GATEWAY_URL}${detailVehicle.policyDocumentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f1f5f9', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i> Poliçe PDF
                      </a>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px' }}
                      onClick={() => {
                        setRenewVehicleId(detailVehicle.id);
                        setRenewPolicyNo(detailVehicle.policyNumber + "-R");
                        setDetailVehicle(null);
                        setIsRenewModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Poliçeyi Yenile
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px' }}
                    onClick={() => {
                      setSelectedVehicleId(detailVehicle.id);
                      setDetailVehicle(null);
                      setIsPolicyModalOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Yeni Poliçe Tanımla
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      {isVehicleModalOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 94, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setIsVehicleModalOpen(false)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'var(--color-deep-twilight)', color: '#fff', padding: '20px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-car-side" style={{ fontSize: '20px' }}></i>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Yeni Araç Ekle</h3>
              </div>
              <button 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setIsVehicleModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateVehicle} style={{ padding: '24px 28px' }}>
              {vfError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {vfError}
                </div>
              )}
              {vfSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-check"></i> {vfSuccess}
                </div>
              )}

              {/* Araç Sahibi */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-user" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                  Araç Sahibi *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={vfOwnerName} 
                  onChange={e => setVfOwnerName(e.target.value)} 
                  placeholder="Örn: Ahmet Yılmaz"
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              {/* Plaka */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-id-badge" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                  Plaka *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={vfPlate} 
                  onChange={e => setVfPlate(e.target.value)} 
                  placeholder="Örn: 34 ABC 123"
                  style={{ background: '#fff', color: '#1e293b', textTransform: 'uppercase' }}
                  required 
                />
              </div>

              {/* Marka + Model Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-industry" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Marka *
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfBrand} 
                    onChange={e => setVfBrand(e.target.value)} 
                    placeholder="Örn: Toyota"
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-car" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Model *
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfModel} 
                    onChange={e => setVfModel(e.target.value)} 
                    placeholder="Örn: Corolla"
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                </div>
              </div>

              {/* Yıl + Motor Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-calendar" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Yıl *
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={vfYear} 
                    onChange={e => setVfYear(e.target.value)} 
                    placeholder="Örn: 2023"
                    min="1950" max="2030"
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-gauge-high" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Motor Hacmi (Litre)
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfEngineCapacity} 
                    onChange={e => setVfEngineCapacity(e.target.value)} 
                    placeholder="Örn: 1.6"
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* Kasa Tipi */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-truck-pickup" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                  Kasa Tipi
                </label>
                <select 
                  className="form-input" 
                  value={vfBodyType} 
                  onChange={e => setVfBodyType(e.target.value)}
                  style={{ background: '#fff', color: '#1e293b' }}
                >
                  {["Sedan","OffRoad","Hatchback","Pickup","Van","Sport","Micro","Convertible","Crossover","SUV","Wagon","Muscle","Roadster","Cabriolet","Limousine"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Şasi No + Ruhsat No Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-barcode" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Şasi Numarası
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfChassisNumber} 
                    onChange={e => setVfChassisNumber(e.target.value)} 
                    placeholder="17 haneli şasi no"
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-file-lines" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Ruhsat Numarası
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfRegistrationNumber} 
                    onChange={e => setVfRegistrationNumber(e.target.value)} 
                    placeholder="Ruhsat seri no"
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px', fontSize: '15px' }} 
                disabled={vfSubmitting}
              >
                {vfSubmitting ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Kaydediliyor...</>
                ) : (
                  <><i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i>Aracı Kaydet</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
