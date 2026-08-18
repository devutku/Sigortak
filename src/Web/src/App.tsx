import React, { useState, useEffect } from 'react';
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
  const [activeMenu, setActiveMenu] = useState<'vehicles' | 'dashboard' | 'add-policy' | 'customers' | 'workorders' | 'policies' | 'inspections' | 'fleet' | 'reminders' | 'quotes' | 'billing' | 'calendar'>('vehicles');
  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
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

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (token) {
      if (activeMenu === 'quotes' || activeMenu === 'dashboard' || activeMenu === 'calendar') {
        fetchQuotes();
      }
      if (
        activeMenu === 'vehicles' || 
        activeMenu === 'dashboard' || 
        activeMenu === 'calendar' || 
        activeMenu === 'policies' || 
        activeMenu === 'inspections' || 
        activeMenu === 'customers' ||
        activeMenu === 'fleet'
      ) {
        fetchVehicles();
      }
      if (activeMenu === 'workorders') {
        fetchWorkOrders();
      }
    }
  }, [token, activeMenu]);

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

  const mapBackendQuoteToFrontend = (q: any): Quote => {
    let policyType = 1;
    if (q.policyType === 'Traffic' || q.policyType === 2) {
      policyType = 2;
    }
    
    let status = 0;
    if (q.status === 'Approved' || q.status === 1) {
      status = 1;
    } else if (q.status === 'Rejected' || q.status === 2) {
      status = 2;
    }

    return {
      id: q.id,
      vehicleId: q.vehicleId,
      vehiclePlate: q.vehiclePlate,
      vehicleInfo: q.vehicleInfo,
      insuranceCompany: q.insuranceCompany,
      agentName: q.agentName,
      policyType: policyType,
      premium: q.premium,
      validityDate: q.validityDate,
      status: status,
      immLimit: q.immLimit,
      replacementCar: q.replacementCarDuration || q.replacementCar || '',
      deductible: q.exemptStatus || q.deductible || '',
      glassCoverage: q.glassCovered !== undefined ? q.glassCovered : q.glassCoverage,
      assistance: q.asstServices === 'Dahil' || q.asstServices === 'true' || q.asstServices === true || q.assistance || false,
      documentUrl: q.pdfDocumentUrl || q.documentUrl || ''
    };
  };

  const fetchQuotes = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/quotes`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok && data) {
        const rawQuotes = data.data || data;
        const mappedQuotes = Array.isArray(rawQuotes) ? rawQuotes.map(mapBackendQuoteToFrontend) : [];
        setQuotes(mappedQuotes);
      }
    } catch (err) {
      console.error("Teklifler yüklenemedi", err);
    }
  };

  const handleApproveQuote = async (id: string) => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/quotes/${id}/approve`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("Teklif başarıyla onaylandı ve poliçeleştirildi!");
        fetchQuotes();
        fetchVehicles();
      } else {
        const errorText = await res.text();
        alert("Teklif onaylanamadı: " + errorText);
      }
    } catch (err) {
      console.error("Teklif onay hatası", err);
    }
  };

  const handleRejectQuote = async (id: string) => {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/quotes/${id}/reject`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("Teklif reddedildi.");
        fetchQuotes();
      } else {
        alert("Teklif reddedilemedi.");
      }
    } catch (err) {
      console.error("Teklif ret hatası", err);
    }
  };

  const handleRequestBulkQuote = async (vehicleIds: string[]) => {
    alert(`${vehicleIds.length} adet araç için toplu teklif talebi (RequestBulkQuoteCommand) fırlatıldı!`);
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
      const matchingVehicle = vehicles.find(v => v.plate.replace(/\s+/g, '').toUpperCase() === policyData.plate.replace(/\s+/g, '').toUpperCase());
      
      if (!matchingVehicle) {
        alert(`Sistemde ${policyData.plate} plakasına ait araç bulunamadı. Lütfen önce aracı kaydedin.`);
        return;
      }

      const formData = new FormData();
      formData.append("vehicleId", matchingVehicle.id);
      formData.append("policyNumber", policyData.policyNumber || "POL-" + Math.floor(Math.random() * 900000 + 100000));
      formData.append("sbmPolicyNumber", policyData.sbmPolicyNumber || "SBM-" + Math.floor(Math.random() * 9000000 + 1000000));
      formData.append("premium", policyData.grossPremium.toString());

      const res = await fetch(`${GATEWAY_URL}/api/v1/policies/renew`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        alert("Poliçe başarıyla portföye kaydedildi ve araçla ilişkilendirildi!");
        fetchVehicles();
        setActiveMenu('policies');
      } else {
        const errText = await res.text();
        alert("Poliçe kaydedilemedi: " + errText);
      }
    } catch (err) {
      console.error("Poliçe kaydetme hatası:", err);
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

  const handlePrintWorkOrder = (wo: any) => {
    const relatedVehicle = vehicles.find(v => v.id === wo.relatedEntityId);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Yazdırma penceresi açılamadı. Lütfen pop-up engelleyicinizi kontrol edin.");
      return;
    }

    const orderTypeStr = (() => {
      switch (wo.orderType) {
        case 'ClaimFile': return 'Hasar Dosyası Açma';
        case 'ExpertAssignment': return 'Eksper Atama';
        case 'PolicyRenewal': return 'Poliçe Yenileme';
        case 'CollectionAndCancellation': return 'Tahsilat & İptal';
        default: return wo.orderType;
      }
    })();

    const priorityStr = (() => {
      switch (wo.priority) {
        case 'Low': return 'Düşük';
        case 'Medium': return 'Orta';
        case 'High': return 'Yüksek';
        case 'Critical': return 'Kritik';
        default: return wo.priority;
      }
    })();

    const statusStr = (() => {
      switch (wo.status) {
        case 'New': return 'Yeni';
        case 'Assigned': return 'Atandı';
        case 'InProgress': return 'İşlemde';
        case 'Completed': return 'Tamamlandı';
        case 'Cancelled': return 'İptal Edildi';
        default: return wo.status;
      }
    })();

    const dateStr = new Date(wo.createdAt).toLocaleDateString('tr-TR') + ' ' + new Date(wo.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const vehicleInfoHtml = relatedVehicle ? `
      <div class="field">
        <span class="field-label">Plaka:</span>
        <span class="field-value" style="font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${relatedVehicle.plate}</span>
      </div>
      <div class="field">
        <span class="field-label">Marka / Model:</span>
        <span class="field-value">${relatedVehicle.brand} ${relatedVehicle.model}</span>
      </div>
      <div class="field">
        <span class="field-label">Yıl / Kasa:</span>
        <span class="field-value">${relatedVehicle.year} / ${relatedVehicle.bodyType || 'Sedan'}</span>
      </div>
      <div class="field">
        <span class="field-label">Araç Sahibi:</span>
        <span class="field-value">${relatedVehicle.ownerName || '-'}</span>
      </div>
    ` : `
      <div class="field" style="color: #64748b; font-style: italic;">
        Bu iş emri için ilişkili bir araç bulunmamaktadır.
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>İş Emri - ${wo.orderNumber}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0077b6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #03045e;
            }
            .doc-title {
              text-align: right;
            }
            .doc-title h1 {
              margin: 0;
              font-size: 20px;
              color: #0077b6;
            }
            .doc-title p {
              margin: 5px 0 0 0;
              font-size: 12px;
              color: #64748b;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              background-color: #f8fafc;
            }
            .card h3 {
              margin-top: 0;
              margin-bottom: 12px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
              color: #03045e;
              font-size: 14px;
              text-transform: uppercase;
            }
            .field {
              margin-bottom: 8px;
              font-size: 13px;
            }
            .field-label {
              font-weight: bold;
              color: #475569;
            }
            .field-value {
              color: #0f172a;
            }
            .description-box {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 30px;
            }
            .description-box h3 {
              margin-top: 0;
              color: #03045e;
              font-size: 14px;
              text-transform: uppercase;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
            }
            .description-content {
              font-size: 13px;
              white-space: pre-line;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
            }
            .signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-around;
            }
            .signature-box {
              text-align: center;
              width: 200px;
              border-top: 1px dashed #64748b;
              padding-top: 8px;
              font-size: 13px;
              font-weight: bold;
              color: #475569;
            }
            @media print {
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Sigortak</div>
            <div class="doc-title">
              <h1>OPERASYONEL İŞ EMRİ FORMU</h1>
              <p>Oluşturulma Tarihi: ${dateStr}</p>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>İŞ EMRİ DETAYLARI</h3>
              <div class="field">
                <span class="field-label">İş Emri No:</span>
                <span class="field-value" style="font-weight: bold;">${wo.orderNumber}</span>
              </div>
              <div class="field">
                <span class="field-label">İş Tipi:</span>
                <span class="field-value">${orderTypeStr}</span>
              </div>
              <div class="field">
                <span class="field-label">Öncelik:</span>
                <span class="field-value">${priorityStr}</span>
              </div>
              <div class="field">
                <span class="field-label">Durum:</span>
                <span class="field-value">${statusStr}</span>
              </div>
              <div class="field">
                <span class="field-label">Özel Notlar:</span>
                <span class="field-value">${wo.specialNotes || '-'}</span>
              </div>
            </div>

            <div class="card">
              <h3>ARAÇ BİLGİLERİ</h3>
              ${vehicleInfoHtml}
            </div>
          </div>

          <div class="description-box">
            <h3>İŞ AÇIKLAMASI & TALİMATLAR</h3>
            <div class="description-content">
              <strong>${wo.title}</strong>
              <p>${wo.description}</p>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">Düzenleyen (Ad Soyad / İmza)</div>
            <div class="signature-box">Teslim Alan (Ad Soyad / İmza)</div>
          </div>

          <div class="footer">
            <p>Sigortak Güvenli Araç ve Muayene Takip Sistemi</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    <MainLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} handleLogout={handleLogout}>
      {activeMenu === 'dashboard' && (
        <DashboardView 
          vehicles={vehicles} 
          quotes={quotes} 
          setActiveMenu={setActiveMenu} 
          onApproveQuote={handleApproveQuote}
        />
      )}
      {activeMenu === 'calendar' && (
        <DashboardView 
          vehicles={vehicles} 
          quotes={quotes} 
          setActiveMenu={setActiveMenu} 
          onApproveQuote={handleApproveQuote}
        />
      )}
      {activeMenu === 'customers' && (
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
      )}
      {activeMenu === 'vehicles' && (
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
      )}
      {activeMenu === 'policies' && (
        <PoliciesView
          vehicles={vehicles}
          onOpenRenewModal={(vehicleId, policyNumber) => {
            setRenewVehicleId(vehicleId);
            setRenewPolicyNo(policyNumber + "-R");
            setIsRenewModalOpen(true);
          }}
          GATEWAY_URL={GATEWAY_URL}
        />
      )}
      {activeMenu === 'add-policy' && (
        <OCRUploadView onSavePolicy={handleSavePolicy} />
      )}
      {activeMenu === 'inspections' && (
        <InspectionsView vehicles={vehicles} GATEWAY_URL={GATEWAY_URL} />
      )}
      {activeMenu === 'fleet' && (
        <FleetView
          vehicles={vehicles}
          onAddVehicles={handleAddVehicles}
          onRequestBulkQuote={handleRequestBulkQuote}
        />
      )}
      {activeMenu === 'workorders' && (
        <WorkOrdersView
          workOrders={workOrders}
          setIsWorkOrderModalOpen={setIsWorkOrderModalOpen}
          handlePrintWorkOrder={handlePrintWorkOrder}
          handleUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
          loading={loading}
        />
      )}
      {activeMenu === 'quotes' && (
        <QuotesView
          quotes={quotes}
          onApproveQuote={handleApproveQuote}
          onRejectQuote={handleRejectQuote}
          GATEWAY_URL={GATEWAY_URL}
        />
      )}

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
                  style={{ background: '#fff', color: '#1e293b', minHeight: '80px', fontFamily: 'inherit', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}
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

      {/* Detail Vehicle Modal */}
      {detailVehicle && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 94, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setDetailVehicle(null)}
        >
          <div 
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'var(--color-deep-twilight)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="plate-badge">{detailVehicle.plate}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Araç Detayı</h3>
              </div>
              <button 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setDetailVehicle(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '8px' }}>
                {detailVehicle.year} {detailVehicle.brand} {detailVehicle.model}
              </h4>

              {/* Owner Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Araç Sahibi</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{detailVehicle.ownerName || 'Bilinmiyor'}</span>
                </div>
                {detailVehicle.ownerTcNo && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>T.C. Kimlik No</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{detailVehicle.ownerTcNo}</span>
                  </div>
                )}
              </div>

              {/* Technical Specs */}
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
    </MainLayout>
  );
}
