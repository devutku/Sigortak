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
  ownerTcNo?: string;
  ownerAddress?: string;
  usageType?: string;
  trafficRegistrationDate?: string;
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
  sbmPolicyNumber?: string;
  policyStartDate?: string;
  policyEndDate?: string;
  policyPremium?: number;
  policyDocumentUrl?: string;
}

const GATEWAY_URL = "http://localhost:5000";

const CAR_BRANDS = [
  "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Citroen", "Cupra", "Dacia", "DS Automobiles", 
  "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Maserati", 
  "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", 
  "Renault", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Togg", "Toyota", "Volvo", "Volkswagen"
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);
  const [loading, setLoading] = useState(false);
  
  // Navigation & filtering states matching Web_old
  const [activeMenu, setActiveMenu] = useState<'vehicles' | 'dashboard' | 'add-policy' | 'customers' | 'workorders'>('vehicles');
  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [woType, setWoType] = useState("1");
  const [woPriority, setWoPriority] = useState("2");
  const [woRelatedEntityId, setWoRelatedEntityId] = useState("");
  const [woSpecialNotes, setWoSpecialNotes] = useState("");
  const [woSuccess, setWoSuccess] = useState("");
  const [woError, setWoError] = useState("");
  const [woSubmitting, setWoSubmitting] = useState(false);

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Vehicle Form State
  const [vfPlate, setVfPlate] = useState("");
  const [vfBrand, setVfBrand] = useState("");
  const [vfModel, setVfModel] = useState("");
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const brandSuggestions = vfBrand.trim() === "" 
    ? CAR_BRANDS 
    : CAR_BRANDS.filter(brand => brand.toLowerCase().includes(vfBrand.toLowerCase()) && brand.toLowerCase() !== vfBrand.toLowerCase());
  const [vfYear, setVfYear] = useState("");
  const [vfEngineCapacity, setVfEngineCapacity] = useState("");
  const [vfEngineNumber, setVfEngineNumber] = useState("");
  const [vfChassisNumber, setVfChassisNumber] = useState("");
  const [vfRegistrationNumber, setVfRegistrationNumber] = useState("");
  const [vfOwnerName, setVfOwnerName] = useState("");
  const [vfOwnerTcNo, setVfOwnerTcNo] = useState("");
  const [vfOwnerAddress, setVfOwnerAddress] = useState("");
  const [vfUsageType, setVfUsageType] = useState("");
  const [vfTrafficRegistrationDate, setVfTrafficRegistrationDate] = useState("");
  const [vfBodyType, setVfBodyType] = useState("Sedan");
  const [vfSuccess, setVfSuccess] = useState("");
  const [vfError, setVfError] = useState("");
  const [vfSubmitting, setVfSubmitting] = useState(false);

  // Policy Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [sbmPolicyNumber, setSbmPolicyNumber] = useState("");
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
  const [renewSbmPolicyNo, setRenewSbmPolicyNo] = useState("");
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

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/workorders`, {
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
        setWorkOrders(data.data);
      }
    } catch (err) {
      console.error("İş emirleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setWoError("");
    setWoSuccess("");
    if (!woTitle || !woDescription) {
      setWoError("Lütfen başlık ve açıklama alanlarını doldurun.");
      return;
    }

    setWoSubmitting(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/workorders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: woTitle,
          description: woDescription,
          orderType: parseInt(woType),
          priority: parseInt(woPriority),
          relatedEntityId: woRelatedEntityId || null,
          specialNotes: woSpecialNotes
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "İş emri oluşturulurken bir hata oluştu.");
      }
      setWoSuccess("İş emri başarıyla oluşturuldu.");
      setWoTitle("");
      setWoDescription("");
      setWoRelatedEntityId("");
      setWoSpecialNotes("");
      fetchWorkOrders();
      setTimeout(() => {
        setIsWorkOrderModalOpen(false);
        setWoSuccess("");
      }, 1500);
    } catch (err: any) {
      setWoError(err.message);
    } finally {
      setWoSubmitting(false);
    }
  };

  const handleUpdateWorkOrderStatus = async (id: string, status: number) => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/workorders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchWorkOrders();
      } else {
        const data = await res.json();
        alert(data.message || "İş emri durumu güncellenemedi.");
      }
    } catch (err) {
      console.error("Durum güncellenemedi", err);
    }
  };

  useEffect(() => {
    if (token && activeMenu === 'workorders') {
      fetchWorkOrders();
    }
  }, [token, activeMenu]);

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
      formData.append("sbmPolicyNumber", sbmPolicyNumber);
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
      setSbmPolicyNumber("");
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
      formData.append("sbmPolicyNumber", renewSbmPolicyNo);
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
      setRenewSbmPolicyNo("");
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
        engineNumber: vfEngineNumber,
        chassisNumber: vfChassisNumber,
        registrationNumber: vfRegistrationNumber,
        ownerId: "00000000-0000-0000-0000-000000000000",
        ownerName: vfOwnerName,
        ownerTcNo: vfOwnerTcNo,
        ownerAddress: vfOwnerAddress,
        usageType: vfUsageType,
        trafficRegistrationDate: vfTrafficRegistrationDate || null,
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
      setVfEngineCapacity(""); setVfEngineNumber(""); setVfChassisNumber(""); setVfRegistrationNumber("");
      setVfOwnerName(""); setVfOwnerTcNo(""); setVfOwnerAddress(""); setVfUsageType(""); setVfTrafficRegistrationDate("");
      setVfBodyType("Sedan");

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

  // Render Splash Screen
  if (showSplash) {
    return (
      <div id="splashScreen" className="splash-container">
        <div className="splash-content">
          <div className="accident-scene">
            <i className="fa-solid fa-car car-actor"></i>
            <i className="fa-solid fa-burst burst-effect"></i>
            <i className="fa-solid fa-circle-exclamation barrier-actor"></i>
          </div>
          <h1 className="splash-title">Sigortak</h1>
          <p className="splash-subtitle">Kaza Geliyorum Der, SigorTAK diye Korur...</p>
        </div>
      </div>
    );
  }

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
          <a 
            href="#" 
            className={`menu-item ${activeMenu === 'customers' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveMenu('customers'); }}
          >
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
          <a 
            href="#" 
            className={`menu-item ${activeMenu === 'workorders' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveMenu('workorders'); }}
          >
            <i className="fa-solid fa-file-invoice"></i> İş Emirleri
          </a>
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
            <span>{activeMenu === 'customers' ? 'Müşteriler' : activeMenu === 'workorders' ? 'İş Emirleri' : 'Araçlarım'}</span>
            <i className="fa-solid fa-chevron-right separator"></i>
            <span className="active">{activeMenu === 'customers' ? 'Tüm Müşteriler' : activeMenu === 'workorders' ? 'Operasyon Listesi' : 'Tüm Araçlar'}</span>
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
        {activeMenu === 'dashboard' && (() => {
          // Calendar variables
          const today = new Date();
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth();
          const currentMonthName = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

          const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
          // Adjust Sunday (0) to index 6, Monday (1) to index 0, etc.
          const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

          const calendarDays: (number | null)[] = [];
          for (let i = 0; i < adjustedFirstDayOfWeek; i++) {
            calendarDays.push(null);
          }
          for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(i);
          }

          const getCalendarEvents = (day: number) => {
            return vehicles.filter(v => {
              if (!v.insuranceEndDate) return false;
              const date = new Date(v.insuranceEndDate);
              return date.getFullYear() === currentYear && date.getMonth() === currentMonth && date.getDate() === day;
            });
          };

          const getInspectionEvents = (day: number) => {
            return vehicles.filter(v => {
              if (!v.inspectionDate) return false;
              const date = new Date(v.inspectionDate);
              return date.getFullYear() === currentYear && date.getMonth() === currentMonth && date.getDate() === day;
            });
          };

          // Pie chart stats
          const zamaninVarCount = vehicles.filter(v => v.inspectionStatus === 'ZAMANIN VAR' || v.inspectionStatus === 'MUAYENE ZAMANIN VAR').length;
          const dolmakUzereCount = vehicles.filter(v => v.inspectionStatus === 'MUAYENE DOLMAK ÜZERE' || v.inspectionStatus === 'SİGORTA DOLMAK ÜZERE').length;
          const dolduCount = vehicles.filter(v => v.inspectionStatus === 'MUAYENE DOLDU' || v.inspectionStatus === 'SİGORTA DOLDU').length;
          const belirsizCount = vehicles.length - (zamaninVarCount + dolmakUzereCount + dolduCount);

          const totalInspect = vehicles.length || 1;
          const pZamaninVar = (zamaninVarCount / totalInspect) * 100;
          const pDolmakUzere = (dolmakUzereCount / totalInspect) * 100;
          const pDoldu = (dolduCount / totalInspect) * 100;

          const pieChartBackground = `conic-gradient(
            #0077b6 0% ${pZamaninVar}%,
            #f8961e ${pZamaninVar}% ${pZamaninVar + pDolmakUzere}%,
            #ef4444 ${pZamaninVar + pDolmakUzere}% ${pZamaninVar + pDolmakUzere + pDoldu}%,
            #64748b ${pZamaninVar + pDolmakUzere + pDoldu}% 100%
          )`;

          return (
            <div style={{ padding: '20px 0' }}>
              <h2 style={{ marginBottom: '20px', color: 'var(--color-deep-twilight)' }}>Kontrol Paneli Özeti</h2>
              
              {/* Summary Cards */}
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

              {/* Grid Layout for Pie Chart and Calendar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                
                {/* Pie Chart Card */}
                <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-deep-twilight)', marginBottom: '20px', alignSelf: 'flex-start' }}>
                    <i className="fa-solid fa-chart-pie" style={{ marginRight: '8px', color: 'var(--color-bright-teal)' }}></i>
                    Muayene Durum Dağılımı
                  </h3>
                  
                  {vehicles.length === 0 ? (
                    <div style={{ color: '#64748b', margin: '40px 0' }}>Veri bulunmuyor</div>
                  ) : (
                    <>
                      {/* Circle Donut Chart */}
                      <div style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '50%',
                        background: pieChartBackground,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        marginBottom: '24px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '110px',
                          height: '110px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>{vehicles.length}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Araç</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0077b6' }}></div>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Zamanın Var ({zamaninVarCount})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f8961e' }}></div>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Dolmak Üzere ({dolmakUzereCount})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }}></div>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Doldu ({dolduCount})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#64748b' }}></div>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Belirsiz ({belirsizCount})</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Calendar Card */}
                <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-deep-twilight)', display: 'flex', alignItems: 'center' }}>
                      <i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', color: 'var(--color-bright-teal)' }}></i>
                      Sigorta & Muayene Takvimi
                    </h3>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-bright-teal)', backgroundColor: 'var(--color-light-cyan)', padding: '4px 10px', borderRadius: '20px' }}>
                      {currentMonthName}
                    </span>
                  </div>

                  {/* Calendar Days Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(dayName => (
                      <div key={dayName}>{dayName}</div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {calendarDays.map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} style={{ height: '42px' }}></div>;
                      }

                      const isSelected = selectedCalendarDay === day;
                      const insuranceEvents = getCalendarEvents(day);
                      const inspectionEvents = getInspectionEvents(day);
                      const hasEvents = insuranceEvents.length > 0 || inspectionEvents.length > 0;

                      return (
                        <div
                          key={`day-${day}`}
                          onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                          style={{
                            height: '42px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--color-bright-teal)' : '1px solid #f1f5f9',
                            backgroundColor: isSelected ? 'var(--color-light-cyan)' : hasEvents ? '#fffbeb' : '#f8fafc',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = hasEvents ? '#fffbeb' : '#f8fafc';
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--color-bright-teal)' : 'var(--color-deep-twilight)' }}>
                            {day}
                          </span>
                          
                          {/* Event Indicators */}
                          {hasEvents && (
                            <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '4px' }}>
                              {insuranceEvents.length > 0 && (
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444' }} title="Sigorta Bitişi"></div>
                              )}
                              {inspectionEvents.length > 0 && (
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f8961e' }} title="Muayene Günü"></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Day Event Details */}
                  {selectedCalendarDay !== null && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--color-bright-teal)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>{selectedCalendarDay} {currentMonthName} Detayları</span>
                        <button 
                          onClick={() => setSelectedCalendarDay(null)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      {(() => {
                        const ins = getCalendarEvents(selectedCalendarDay);
                        const insp = getInspectionEvents(selectedCalendarDay);
                        if (ins.length === 0 && insp.length === 0) {
                          return <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Bu güne ait herhangi bir hatırlatma bulunmuyor.</div>;
                        }
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {ins.map(v => (
                              <div key={`ins-${v.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                <i className="fa-solid fa-file-shield" style={{ color: '#ef4444' }}></i>
                                <span><strong>{v.plate}</strong> - Sigorta Poliçesi Sona Eriyor ({v.brand} {v.model})</span>
                              </div>
                            ))}
                            {insp.map(v => (
                              <div key={`insp-${v.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                <i className="fa-solid fa-wrench" style={{ color: '#f8961e' }}></i>
                                <span><strong>{v.plate}</strong> - Muayene Tarihi ({v.brand} {v.model})</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })()}

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

        {/* Customers View */}
        {activeMenu === 'customers' && (() => {
          // Group vehicles by ownerName
          const groups: { [name: string]: Vehicle[] } = {};
          vehicles.forEach(v => {
            const owner = v.ownerName || 'Bilinmeyen Müşteri';
            if (!groups[owner]) {
              groups[owner] = [];
            }
            groups[owner].push(v);
          });

          const customersList = Object.keys(groups).map(name => ({
            name,
            vehicles: groups[name]
          })).filter(c => 
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            c.vehicles.some(v => v.plate.toLowerCase().includes(customerSearchTerm.toLowerCase()))
          );

          return (
            <>
              <section className="action-bar">
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
                  Müşteri Listesi
                </div>

                <div className="search-and-buttons" style={{ marginLeft: 'auto' }}>
                  <div className="search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      placeholder="Müşteri adı veya Plaka ile ara..." 
                      value={customerSearchTerm}
                      onChange={e => setCustomerSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
              ) : customersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <i className="fa-solid fa-users" style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}></i>
                  <p>Müşteri bulunamadı.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                  {customersList.map((customer, idx) => (
                    <div 
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        background: '#fff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Customer Info Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-light-cyan)',
                            color: 'var(--color-bright-teal)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 700
                          }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-deep-twilight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {customer.name}
                              {customer.vehicles[0]?.ownerTcNo && (
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                                  T.C.: {customer.vehicles[0].ownerTcNo}
                                </span>
                              )}
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}><i className="fa-solid fa-car" style={{ marginRight: '4px' }}></i>Toplam Araç: {customer.vehicles.length}</span>
                              {customer.vehicles[0]?.ownerAddress && (
                                <span style={{ fontSize: '12px', color: '#64748b' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{customer.vehicles[0].ownerAddress}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vehicles & Policy Details grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {customer.vehicles.map(v => (
                          <div 
                            key={v.id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '16px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                              {/* Plate and Brand Model */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <div className="plate-badge" style={{ fontSize: '0.95rem', padding: '3px 10px' }}>{v.plate}</div>
                                <div>
                                  <span style={{ fontWeight: 700, color: 'var(--color-deep-twilight)', fontSize: '0.95rem' }}>{v.year} {v.brand} {v.model}</span>
                                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>({v.bodyType || 'Sedan'})</span>
                                </div>
                              </div>

                              {/* Action Buttons for this specific vehicle */}
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {v.policyId ? (
                                  <>
                                    {v.policyDocumentUrl && (
                                      <a 
                                        href={`${GATEWAY_URL}${v.policyDocumentUrl}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 10px', fontSize: '12px', background: '#fff', border: '1px solid #cbd5e1' }}
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
                                      <i className="fa-solid fa-arrows-rotate"></i> Poliçe Yenile
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
                            </div>

                            {/* Technical Specs Needed for Policy (Şasi No, Ruhsat No, Motor No, Kullanım Tarzı, vb.) */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                              gap: '12px',
                              marginTop: '14px',
                              paddingTop: '14px',
                              borderTop: '1px dashed #e2e8f0'
                            }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Şasi Numarası</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)', fontFamily: 'monospace' }}>{v.chassisNumber || 'Belirtilmemiş'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Ruhsat Numarası</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.registrationNumber || 'Belirtilmemiş'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Motor (Hacim / No)</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>
                                  {v.engineCapacity ? `${v.engineCapacity}L` : '-'} / {v.engineNumber || '-'}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Kullanım / Tescil</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>
                                  {v.usageType || '-'} {v.trafficRegistrationDate ? `(${new Date(v.trafficRegistrationDate).toLocaleDateString('tr-TR')})` : ''}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Aktif Poliçe Durumu</span>
                                {v.policyId ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                                      <i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i>
                                      {v.policyNumber} ({v.insuranceRemainingDays} gün kaldı)
                                    </span>
                                    {v.sbmPolicyNumber && (
                                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                                        SBM: {v.sbmPolicyNumber}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '4px' }}></i>
                                    Poliçe Yok
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {/* WorkOrders View */}
        {activeMenu === 'workorders' && (
          <>
            <section className="action-bar">
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
                Operasyonel İş Emirleri
              </div>

              <button className="btn btn-primary" onClick={() => setIsWorkOrderModalOpen(true)} style={{ marginLeft: 'auto' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>Yeni İş Emri Ekle
              </button>
            </section>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
            ) : workOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <i className="fa-solid fa-file-invoice" style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}></i>
                <p>Kayıtlı iş emri bulunamadı.</p>
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>İş Emri No</th>
                      <th>Başlık</th>
                      <th>Tür</th>
                      <th>Öncelik</th>
                      <th>Durum</th>
                      <th>Oluşturulma Tarihi</th>
                      <th style={{ textAlign: 'right' }}>Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map((wo: any) => (
                      <tr key={wo.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-deep-twilight)' }}>{wo.orderNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{wo.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{wo.description}</div>
                          {wo.specialNotes && (
                            <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', marginTop: '4px' }}>Not: {wo.specialNotes}</div>
                          )}
                        </td>
                        <td>
                          {(() => {
                            switch (wo.orderType) {
                              case 'ClaimFile': return <span className="badge" style={{ background: '#ffedd5', color: '#ea580c' }}>Hasar Dosyası Açma</span>;
                              case 'ExpertAssignment': return <span className="badge" style={{ background: '#dbeafe', color: '#2563eb' }}>Eksper Atama</span>;
                              case 'PolicyRenewal': return <span className="badge" style={{ background: '#d1fae5', color: '#059669' }}>Poliçe Yenileme</span>;
                              case 'CollectionAndCancellation': return <span className="badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>Tahsilat & İptal</span>;
                              default: return <span className="badge">{wo.orderType}</span>;
                            }
                          })()}
                        </td>
                        <td>
                          {(() => {
                            switch (wo.priority) {
                              case 'Low': return <span style={{ color: '#64748b', fontWeight: 600 }}>Düşük</span>;
                              case 'Medium': return <span style={{ color: '#d97706', fontWeight: 600 }}>Orta</span>;
                              case 'High': return <span style={{ color: '#dc2626', fontWeight: 600 }}>Yüksek</span>;
                              case 'Critical': return <span style={{ color: '#7f1d1d', fontWeight: 700, textTransform: 'uppercase' }}>⚠️ Kritik</span>;
                              default: return <span>{wo.priority}</span>;
                            }
                          })()}
                        </td>
                        <td>
                          {(() => {
                            switch (wo.status) {
                              case 'New': return <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>Yeni</span>;
                              case 'Assigned': return <span className="badge" style={{ background: '#faf5ff', color: '#6d28d9' }}>Atandı</span>;
                              case 'InProgress': return <span className="badge" style={{ background: '#fffbeb', color: '#b45309' }}>İşlemde</span>;
                              case 'Completed': return <span className="badge" style={{ background: '#ecfdf5', color: '#047857' }}>Tamamlandı</span>;
                              case 'Cancelled': return <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>İptal Edildi</span>;
                              default: return <span className="badge">{wo.status}</span>;
                            }
                          })()}
                        </td>
                        <td>
                          {new Date(wo.createdAt).toLocaleDateString('tr-TR')} {new Date(wo.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {wo.status !== 'Completed' && wo.status !== 'Cancelled' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateWorkOrderStatus(wo.id, 3)} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                                  title="İşleme Al"
                                >
                                  İşlemde
                                </button>
                                <button 
                                  onClick={() => handleUpdateWorkOrderStatus(wo.id, 4)} 
                                  className="btn btn-primary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                                  title="Tamamla"
                                >
                                  Tamamla
                                </button>
                                <button 
                                  onClick={() => handleUpdateWorkOrderStatus(wo.id, 5)} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                                  title="İptal Et"
                                >
                                  İptal
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* New Work Order Modal */}
      {isWorkOrderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Yeni İş Emri Oluştur</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsWorkOrderModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateWorkOrder} style={{ padding: '24px' }}>
              {woError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
                  {woError}
                </div>
              )}
              {woSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
                  {woSuccess}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Başlık</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={woTitle} 
                  onChange={e => setWoTitle(e.target.value)} 
                  placeholder="Örn: 34ALI534 Kaza Hasar Dosyası"
                  style={{ background: '#fff', color: '#1e293b' }}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea 
                  className="form-input" 
                  value={woDescription} 
                  onChange={e => setWoDescription(e.target.value)} 
                  placeholder="İş emri detay açıklamasını yazın..."
                  style={{ background: '#fff', color: '#1e293b', minHeight: '80px', fontFamily: 'inherit' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">İş Tipi</label>
                  <select 
                    className="form-input" 
                    value={woType} 
                    onChange={e => setWoType(e.target.value)}
                    style={{ background: '#fff', color: '#1e293b' }}
                  >
                    <option value="1">Hasar Dosyası Açma</option>
                    <option value="2">Eksper Atama</option>
                    <option value="3">Poliçe Yenileme</option>
                    <option value="4">Prim Tahsilat & İptal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Öncelik</label>
                  <select 
                    className="form-input" 
                    value={woPriority} 
                    onChange={e => setWoPriority(e.target.value)}
                    style={{ background: '#fff', color: '#1e293b' }}
                  >
                    <option value="1">Düşük</option>
                    <option value="2">Orta</option>
                    <option value="3">Yüksek</option>
                    <option value="4">Kritik</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">İlişkili Araç (Opsiyonel)</label>
                <select 
                  className="form-input" 
                  value={woRelatedEntityId} 
                  onChange={e => setWoRelatedEntityId(e.target.value)}
                  style={{ background: '#fff', color: '#1e293b' }}
                >
                  <option value="">İlişkili araç seçin...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Özel Notlar</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={woSpecialNotes} 
                  onChange={e => setWoSpecialNotes(e.target.value)} 
                  placeholder="Eksper ismi, acil durum detayları..."
                  style={{ background: '#fff', color: '#1e293b' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={woSubmitting}>
                {woSubmitting ? "Oluşturuluyor..." : "İş Emrini Oluştur"}
              </button>
            </form>
          </div>
        </div>
      )}

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

              <div className="form-group">
                <label className="form-label">SBM Poliçe Numarası</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={sbmPolicyNumber} 
                  onChange={e => setSbmPolicyNumber(e.target.value)} 
                  placeholder="Örn: 701161329"
                  style={{ background: '#fff', color: '#1e293b' }}
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
                <label className="form-label">Yeni SBM Poliçe Numarası</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={renewSbmPolicyNo} 
                  onChange={e => setRenewSbmPolicyNo(e.target.value)} 
                  placeholder="Örn: 701161329"
                  style={{ background: '#fff', color: '#1e293b' }}
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
                  {detailVehicle.ownerName || 'Bilinmiyor'} 
                  {detailVehicle.ownerTcNo && ` (T.C.: ${detailVehicle.ownerTcNo})`} &bull; {detailVehicle.bodyType}
                </p>
                {detailVehicle.ownerAddress && (
                  <p style={{ color: 'var(--color-frosted-blue)', fontSize: '12px', marginTop: '4px' }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>
                    {detailVehicle.ownerAddress}
                  </p>
                )}
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
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motor</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginTop: '2px' }}>
                    {detailVehicle.engineCapacity ? `${detailVehicle.engineCapacity} L` : '-'}
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Motor No</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px', wordBreak: 'break-all' }}>
                    {detailVehicle.engineNumber || '-'}
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Şasi No</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px', wordBreak: 'break-all' }}>
                    {detailVehicle.chassisNumber || '-'}
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ruhsat No</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px' }}>
                    {detailVehicle.registrationNumber || '-'}
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kullanım Tarzı</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px' }}>
                    {detailVehicle.usageType || '-'}
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tescil Tarihi</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-deep-twilight)', marginTop: '4px' }}>
                    {detailVehicle.trafficRegistrationDate ? new Date(detailVehicle.trafficRegistrationDate).toLocaleDateString('tr-TR') : '-'}
                  </div>
                </div>
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
                        {detailVehicle.sbmPolicyNumber && (
                          <tr>
                            <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>SBM Poliçe No</td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-deep-twilight)', borderBottom: '1px solid var(--border-color)' }}>{detailVehicle.sbmPolicyNumber}</td>
                          </tr>
                        )}
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

              {/* Araç Sahibi Bilgileri */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-id-card" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    T.C. Kimlik / Vergi No
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfOwnerTcNo} 
                    onChange={e => setVfOwnerTcNo(e.target.value)} 
                    placeholder="11 haneli T.C. No"
                    maxLength={11}
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                  Adres
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={vfOwnerAddress} 
                  onChange={e => setVfOwnerAddress(e.target.value)} 
                  placeholder="Müşteri adresi"
                  style={{ background: '#fff', color: '#1e293b' }}
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
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">
                    <i className="fa-solid fa-industry" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Marka *
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfBrand} 
                    onChange={e => {
                      setVfBrand(e.target.value);
                      setShowBrandSuggestions(true);
                    }} 
                    onFocus={() => setShowBrandSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                    placeholder="Örn: Toyota"
                    style={{ background: '#fff', color: '#1e293b' }}
                    required 
                  />
                  {showBrandSuggestions && brandSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '2px solid var(--color-bright-teal)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      marginTop: '4px'
                    }}>
                      {brandSuggestions.map((brand, idx) => (
                        <div 
                          key={idx}
                          onMouseDown={() => {
                            setVfBrand(brand);
                            setShowBrandSuggestions(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            color: 'var(--color-deep-twilight)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-light-cyan)';
                            e.currentTarget.style.color = 'var(--color-bright-teal)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-deep-twilight)';
                          }}
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-gears" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Motor Numarası
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfEngineNumber} 
                    onChange={e => setVfEngineNumber(e.target.value)} 
                    placeholder="Motor no"
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* Kasa Tipi + Kullanım Tarzı + Tescil Tarihi Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
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
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-briefcase" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Kullanım Tarzı
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={vfUsageType} 
                    onChange={e => setVfUsageType(e.target.value)} 
                    placeholder="Örn: Otomobil Hususi"
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                    Tescil Tarihi
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={vfTrafficRegistrationDate} 
                    onChange={e => setVfTrafficRegistrationDate(e.target.value)} 
                    style={{ background: '#fff', color: '#1e293b' }}
                  />
                </div>
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
