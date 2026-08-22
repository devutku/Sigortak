import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

import type { Vehicle, Quote } from './types';
import { MainLayout } from './layouts/MainLayout';
import { DashboardView } from './modules/dashboard/DashboardView';
import { VehiclesView } from './modules/vehicles/VehiclesView';
import { PoliciesView } from './modules/policies/PoliciesView';
import { InspectionsView } from './modules/inspections/InspectionsView';
import { QuotesView } from './modules/quotes/QuotesView';
import { CustomersView } from './modules/customers/CustomersView';
import { WorkOrdersView } from './modules/workorders/WorkOrdersView';
import { FleetView } from './modules/fleet/FleetView';
import { OCRUploadView } from './modules/policies/OCRUploadView';
import { BillingView } from './modules/billing/BillingView';
import { RemindersView } from './modules/reminders/RemindersView';

import { ToastNotification } from './components/ToastNotification';
import { printWorkOrder } from './utils/printUtils';
import { VehicleDetailModal } from './components/modals/VehicleDetailModal';
import { CreateVehicleModal } from './components/modals/CreateVehicleModal';
import { CreatePolicyModal } from './components/modals/CreatePolicyModal';
import { RenewPolicyModal } from './components/modals/RenewPolicyModal';
import { CreateWorkOrderModal } from './components/modals/CreateWorkOrderModal';
import * as api from './services/api';

const GATEWAY_URL = "http://localhost:5000";



export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    (window as any).showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, type });
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Navigation & filtering states matching Web_old
  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Prefill data for Vehicle Modal (e.g. from OCR)
  const [initialVehicleValues, setInitialVehicleValues] = useState<any>(null);

  // Policy Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Renewal Form State
  const [renewVehicleId, setRenewVehicleId] = useState("");
  const [renewPolicyNo, setRenewPolicyNo] = useState("");

  // Load FontAwesome and fetch vehicles
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (token) {
      if (currentPath === '/quotes' || currentPath === '/dashboard' || currentPath === '/calendar') {
        fetchQuotes();
      }
      if (
        currentPath === '/vehicles' || 
        currentPath === '/dashboard' || 
        currentPath === '/calendar' || 
        currentPath === '/policies' || 
        currentPath === '/inspections' || 
        currentPath === '/customers' ||
        currentPath === '/fleet'
      ) {
        fetchVehicles();
      }
      if (currentPath === '/workorders') {
        fetchWorkOrders();
      }
    }
  }, [token, currentPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const data = await api.login(GATEWAY_URL, { username, password });
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
      const data = await api.getVehicles(GATEWAY_URL, token || "");
      setVehicles(data);
    } catch (err: any) {
      console.error("Araçlar yüklenemedi", err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkOrders(GATEWAY_URL, token || "");
      setWorkOrders(data);
    } catch (err: any) {
      console.error("İş emirleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    if (!token) return;
    try {
      const data = await api.getQuotes(GATEWAY_URL, token);
      setQuotes(data);
    } catch (err) {
      console.error("Teklifler yüklenemedi", err);
    }
  };

  const handleApproveQuote = async (id: string) => {
    try {
      await api.approveQuote(GATEWAY_URL, id, token || "");
      setNotification({ message: "Teklif başarıyla onaylandı ve poliçeleştirildi!", type: "success" });
      fetchQuotes();
      fetchVehicles();
    } catch (err: any) {
      console.error("Teklif onay hatası", err);
      setNotification({ message: "İşlem sırasında hata oluştu: " + err.message, type: "error" });
    }
  };

  const handleRejectQuote = async (id: string) => {
    try {
      await api.rejectQuote(GATEWAY_URL, id, token || "");
      setNotification({ message: "Teklif reddedildi.", type: "success" });
      fetchQuotes();
    } catch (err: any) {
      console.error("Teklif ret hatası", err);
      setNotification({ message: "İşlem sırasında hata oluştu: " + err.message, type: "error" });
    }
  };

  const handleRequestBulkQuote = async (vehicleIds: string[]) => {
    setNotification({ message: `${vehicleIds.length} adet araç için toplu teklif talebi (RequestBulkQuoteCommand) fırlatıldı!`, type: "info" });
  };

  const handleAddVehicles = async (newVehicles: Omit<Vehicle, 'id'>[]) => {
    setLoading(true);
    try {
      for (const v of newVehicles) {
        await fetch(`${GATEWAY_URL}/api/v1/vehicles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            plate: v.plate,
            brand: v.brand,
            model: v.model,
            year: v.year,
            bodyType: v.bodyType,
            ownerName: v.ownerName,
            ownerTcNo: v.ownerTcNo,
            ownerAddress: "İstanbul Filo Şubesi",
            usageType: "Ticari Van",
            engineCapacity: "1.5",
            engineNumber: "ENG-FLT-987",
            chassisNumber: "CHS-FLT-987654321",
            registrationNumber: "REG-FLT-123"
          })
        });
      }
      fetchVehicles();
    } catch (err) {
      console.error("Toplu araç ekleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (policyData: any) => {
    setLoading(true);
    try {
      let matchingVehicle = vehicles.find(v => v.plate.replace(/\s+/g, '').toUpperCase() === policyData.plate.replace(/\s+/g, '').toUpperCase());
      
      if (!matchingVehicle) {
        const vInfo = policyData.vehicleInfo || '';
        const words = vInfo.split(' ');
        const brand = words[0] || 'TANIMSIZ';
        const model = words.slice(1).join(' ') || 'OCR Kayıtlı Araç';
        
        setInitialVehicleValues({
          plate: policyData.plate.replace(/\s+/g, '').toUpperCase(),
          brand,
          model,
          year: policyData.modelYear?.toString() || '2024',
          ownerTcNo: policyData.ownerTcNo || '',
          ownerName: policyData.ownerName || "Filo Müşterisi",
          ownerAddress: policyData.ownerAddress || "Merkez Filo Şubesi",
          engineCapacity: "1.6",
          engineNumber: policyData.engineNumber || "ENG-" + Math.floor(Math.random() * 90000 + 10000),
          chassisNumber: policyData.chassisNumber || "CHS-" + Math.floor(Math.random() * 90000000 + 10000000),
          registrationNumber: "REG-" + Math.floor(Math.random() * 90000 + 10000),
          usageType: policyData.usageType || "Hususi",
          bodyType: "Sedan"
        });
        
        setIsVehicleModalOpen(true);
        setNotification({
          message: `Sistemde ${policyData.plate} plakasına ait araç bulunamadı. OCR verileriyle ekleme formu açıldı.`,
          type: "info"
        });
        return false;
      }

      const formData = new FormData();
      formData.append("vehicleId", matchingVehicle.id);
      formData.append("policyNumber", policyData.policyNumber || "POL-" + Math.floor(Math.random() * 900000 + 100000));
      formData.append("sbmPolicyNumber", policyData.sbmPolicyNumber || "SBM-" + Math.floor(Math.random() * 9000000 + 1000000));
      formData.append("premium", (policyData.premium || policyData.grossPremium || 0).toString());

      // Vade tarihleri — OCR'dan gelen gerçek tarihler
      formData.append("startDate", policyData.startDate || new Date().toISOString().split('T')[0]);
      formData.append("endDate", policyData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Poliçe türü
      const policyTypeVal = (policyData.policyType || 'KASKO').toUpperCase().includes('TRAFIK') ? '0' : '1';
      formData.append("policyType", policyTypeVal);

      // Genişletilmiş alanlar
      if (policyData.company) formData.append("companyName", policyData.company);
      if (policyData.renewalNumber) formData.append("renewalNumber", policyData.renewalNumber);
      if (policyData.agencyCode) formData.append("agencyCode", policyData.agencyCode);
      if (policyData.premium) formData.append("netPremium", policyData.premium.toString());
      if (policyData.commission) formData.append("commission", policyData.commission.toString());
      if (policyData.vehicleValue) formData.append("vehicleValue", policyData.vehicleValue.toString());
      if (policyData.immLimit) formData.append("immLimit", policyData.immLimit);
      if (policyData.personalAccidentCoverage) formData.append("personalAccidentCoverage", policyData.personalAccidentCoverage.toString());
      if (policyData.legalProtection) formData.append("legalProtection", policyData.legalProtection.toString());
      if (policyData.noClaimDiscountRate) formData.append("noClaimDiscountRate", policyData.noClaimDiscountRate.toString());
      if (policyData.noClaimStep) formData.append("noClaimStep", policyData.noClaimStep.toString());
      if (policyData.tramerDocumentNo) formData.append("tramerDocumentNo", policyData.tramerDocumentNo);
      if (policyData.tramerDocumentDate) formData.append("tramerDocumentDate", policyData.tramerDocumentDate);
      if (policyData.discounts && Array.isArray(policyData.discounts)) {
        policyData.discounts.forEach((d: string) => formData.append("discounts", d));
      }
      if (policyData.extraCoverages && Array.isArray(policyData.extraCoverages)) {
        policyData.extraCoverages.forEach((c: string) => formData.append("extraCoverages", c));
      }

      await api.renewPolicy(GATEWAY_URL, formData, token || "");
      setNotification({ message: "Poliçe başarıyla portföye kaydedildi ve araçla ilişkilendirildi!", type: "success" });
      fetchVehicles();
      navigate('/policies');
    } catch (err: any) {
      console.error("Poliçe kaydetme hatası:", err);
      setNotification({ message: "Hata oluştu: Poliçe kaydedilemedi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkOrderStatus = async (id: string, status: number) => {
    try {
      await api.updateWorkOrderStatus(GATEWAY_URL, id, status, token || "");
      fetchWorkOrders();
    } catch (err: any) {
      console.error("Durum güncellenemedi", err);
      setNotification({ message: "İşlem sırasında hata oluştu: " + err.message, type: "error" });
    }
  };

  const handlePrintWorkOrder = (wo: any) => {
    const success = printWorkOrder(wo, vehicles);
    if (!success) {
      setNotification({ message: "Yazdırma penceresi açılamadı. Lütfen pop-up engelleyicinizi kontrol edin.", type: "error" });
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
    <MainLayout handleLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <DashboardView 
            vehicles={vehicles} 
            quotes={quotes} 
            onApproveQuote={handleApproveQuote}
          />
        } />
        <Route path="/calendar" element={
          <DashboardView 
            vehicles={vehicles} 
            quotes={quotes} 
            onApproveQuote={handleApproveQuote}
          />
        } />
        <Route path="/customers" element={
          <CustomersView
            vehicles={vehicles}
            customerSearchTerm={customerSearchTerm}
            setCustomerSearchTerm={setCustomerSearchTerm}
            loading={loading}
            GATEWAY_URL={GATEWAY_URL}
            setRenewVehicleId={setRenewVehicleId}
            setRenewPolicyNo={setRenewPolicyNo}
            setIsRenewModalOpen={setIsRenewModalOpen}
            setSelectedVehicleId={setSelectedVehicleId}
            setIsPolicyModalOpen={setIsPolicyModalOpen}
          />
        } />
        <Route path="/vehicles" element={
          <VehiclesView
            filteredVehicles={filteredVehicles}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            setIsVehicleModalOpen={setIsVehicleModalOpen}
            setRenewVehicleId={setRenewVehicleId}
            setRenewPolicyNo={setRenewPolicyNo}
            setIsRenewModalOpen={setIsRenewModalOpen}
            setSelectedVehicleId={setSelectedVehicleId}
            setIsPolicyModalOpen={setIsPolicyModalOpen}
            setDetailVehicle={setDetailVehicle}
            loading={loading}
            GATEWAY_URL={GATEWAY_URL}
            getStatusBadge={getStatusBadge}
          />
        } />
        <Route path="/policies" element={
          <PoliciesView
            vehicles={vehicles}
            onOpenRenewModal={(vehicleId, policyNumber) => {
              setRenewVehicleId(vehicleId);
              setRenewPolicyNo(policyNumber + "-R");
              setIsRenewModalOpen(true);
            }}
            GATEWAY_URL={GATEWAY_URL}
          />
        } />
        <Route path="/add-policy" element={
          <OCRUploadView onSavePolicy={handleSavePolicy} vehicles={vehicles} GATEWAY_URL={GATEWAY_URL} />
        } />
        <Route path="/inspections" element={
          <InspectionsView vehicles={vehicles} GATEWAY_URL={GATEWAY_URL} />
        } />
        <Route path="/fleet" element={
          <FleetView
            vehicles={vehicles}
            onAddVehicles={handleAddVehicles}
            onRequestBulkQuote={handleRequestBulkQuote}
          />
        } />
        <Route path="/workorders" element={
          <WorkOrdersView
            workOrders={workOrders}
            setIsWorkOrderModalOpen={setIsWorkOrderModalOpen}
            handlePrintWorkOrder={handlePrintWorkOrder}
            handleUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
            loading={loading}
          />
        } />
        <Route path="/quotes" element={
          <QuotesView
            quotes={quotes}
            onApproveQuote={handleApproveQuote}
            onRejectQuote={handleRejectQuote}
            GATEWAY_URL={GATEWAY_URL}
          />
        } />
        <Route path="/billing" element={
          <BillingView vehicles={vehicles} GATEWAY_URL={GATEWAY_URL} />
        } />
        <Route path="/reminders" element={
          <RemindersView
            vehicles={vehicles}
            onOpenRenewModal={(vehicleId, policyNumber) => {
              setRenewVehicleId(vehicleId);
              setRenewPolicyNo(policyNumber + "-R");
              setIsRenewModalOpen(true);
            }}
          />
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* New Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        vehicles={vehicles}
        onSuccess={() => {
          fetchWorkOrders();
          setNotification({ message: "İş emri başarıyla oluşturuldu.", type: "success" });
        }}
        token={token || ""}
        gatewayUrl={GATEWAY_URL}
      />

      {/* Define Policy Modal */}
      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        vehicles={vehicles}
        onSuccess={() => {
          fetchVehicles();
          setNotification({ message: "Poliçe başarıyla tanımlandı!", type: "success" });
        }}
        token={token || ""}
        gatewayUrl={GATEWAY_URL}
        initialVehicleId={selectedVehicleId}
      />

      {/* Renew Policy Modal */}
      <RenewPolicyModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        vehicleId={renewVehicleId}
        policyNumber={renewPolicyNo}
        onSuccess={() => {
          fetchVehicles();
          setNotification({ message: "Poliçe başarıyla yenilendi!", type: "success" });
        }}
        token={token || ""}
        gatewayUrl={GATEWAY_URL}
      />

      {/* Detail Vehicle Modal */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        onClose={() => setDetailVehicle(null)}
        onOpenRenewModal={(vehicleId, policyNumber) => {
          setRenewVehicleId(vehicleId);
          setRenewPolicyNo(policyNumber);
          setDetailVehicle(null);
          setIsRenewModalOpen(true);
        }}
        onOpenCreatePolicyModal={(vehicleId) => {
          setSelectedVehicleId(vehicleId);
          setDetailVehicle(null);
          setIsPolicyModalOpen(true);
        }}
        gatewayUrl={GATEWAY_URL}
      />

      {/* New Vehicle Modal */}
      <CreateVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setInitialVehicleValues(null);
        }}
        onSuccess={() => {
          fetchVehicles();
        }}
        token={token || ""}
        gatewayUrl={GATEWAY_URL}
        initialValues={initialVehicleValues}
      />

      {/* Toast Notification */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </MainLayout>
  );
}
