import React, { useState } from 'react';
import type { Vehicle } from '../../types';

interface FleetViewProps {
  vehicles: Vehicle[];
  onAddVehicles: (newVehicles: Omit<Vehicle, 'id'>[]) => void;
  onRequestBulkQuote: (vehicleIds: string[]) => Promise<void>;
}

interface SubFleet {
  id: string;
  name: string;
  manager: string;
  annualCost: number;
  lossRatio: number; // percentage
}

// Fixed mock driver profiles & sub-fleet mappings for existing vehicles
const MOCK_DRIVERS: Record<string, { name: string; riskScore: number; zimmetDate: string; subFleetId: string }> = {
  '34ABC123': { name: 'Ahmet Yılmaz', riskScore: 88, zimmetDate: '01.01.2026', subFleetId: 'mgmt' },
  '34ALI534': { name: 'Mehmet Kaya', riskScore: 65, zimmetDate: '15.03.2026', subFleetId: 'sales' },
  '34XYZ789': { name: 'Can Demir', riskScore: 42, zimmetDate: '10.02.2026', subFleetId: 'logistics' },
  '34KGO102': { name: 'Ayşe Şahin', riskScore: 92, zimmetDate: '12.04.2026', subFleetId: 'sales' },
};

const SUB_FLEETS: SubFleet[] = [
  { id: 'all', name: 'Tüm Filo', manager: 'Genel Yönetici', annualCost: 485000, lossRatio: 52 },
  { id: 'sales', name: 'İstanbul Bölge Satış', manager: 'Murat Karaca', annualCost: 185000, lossRatio: 64 },
  { id: 'logistics', name: 'Lojistik / Ağır Vasıta', manager: 'Süleyman Öztürk', annualCost: 240000, lossRatio: 41 },
  { id: 'mgmt', name: 'Genel Merkez Yönetim', manager: 'Zeynep Aksoy', annualCost: 60000, lossRatio: 18 }
];

export const FleetView: React.FC<FleetViewProps> = ({ vehicles, onAddVehicles, onRequestBulkQuote }) => {
  const [selectedSubFleet, setSelectedSubFleet] = useState<string>('all');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [targetDeptId, setTargetDeptId] = useState('sales');

  // Dynamic driver info generator helper
  const getDriverInfo = (plate: string) => {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    if (MOCK_DRIVERS[cleanPlate]) return MOCK_DRIVERS[cleanPlate];
    
    // Deterministic fallback generator
    const code = cleanPlate.charCodeAt(0) + cleanPlate.charCodeAt(cleanPlate.length - 1);
    const names = ['Hasan Çelik', 'Elif Yıldız', 'Burak Aydın', 'Selin Yılmaz', 'Onur Koç'];
    const subFleets = ['sales', 'logistics', 'mgmt'];
    return {
      name: names[code % names.length],
      riskScore: 50 + (code % 48), // 50 to 98
      zimmetDate: `01.0${(code % 9) + 1}.2026`,
      subFleetId: subFleets[code % subFleets.length]
    };
  };

  const renderStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const cleanStatus = status.toUpperCase();
    
    let styles: React.CSSProperties = {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase'
    };

    if (cleanStatus === 'ZAMANIN VAR' || cleanStatus === 'AKTIF' || cleanStatus === 'SIGORTA AKTIF') {
      styles = {
        ...styles,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981'
      };
    } else if (cleanStatus === 'MUAYENE DOLMAK ÜZERE' || cleanStatus === 'DOLMAK ÜZERE' || cleanStatus === 'MUAYENE DOLMAK UZERE') {
      styles = {
        ...styles,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#f59e0b'
      };
    } else if (cleanStatus === 'MUAYENE DOLDU' || cleanStatus === 'SİGORTA DOLDU' || cleanStatus === 'DOLDU' || cleanStatus === 'SIGORTA DOLDU') {
      styles = {
        ...styles,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444'
      };
    } else {
      styles = {
        ...styles,
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        color: '#64748b'
      };
    }

    return <span style={styles}>{status}</span>;
  };

  // Filtered vehicles list based on sub-fleet selection
  const filteredVehicles = vehicles.map(v => ({
    ...v,
    driver: getDriverInfo(v.plate)
  })).filter(v => selectedSubFleet === 'all' || v.driver.subFleetId === selectedSubFleet);

  // Totals calculations
  const totalCost = filteredVehicles.reduce((sum, v) => sum + (v.policyPremium || 0), 0) || 125000; // fallback default
  const avgPremium = Math.round(totalCost / (filteredVehicles.length || 1));
  const avgLossRatio = SUB_FLEETS.find(f => f.id === selectedSubFleet)?.lossRatio || 45;
  const criticalCount = filteredVehicles.filter(v => v.inspectionStatus === 'MUAYENE DOLDU' || v.insuranceStatus === 'SİGORTA DOLDU').length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedVehicleIds(filteredVehicles.map(v => v.id));
    } else {
      setSelectedVehicleIds([]);
    }
  };

  const handleSelectVehicle = (id: string) => {
    if (selectedVehicleIds.includes(id)) {
      setSelectedVehicleIds(selectedVehicleIds.filter(vId => vId !== id));
    } else {
      setSelectedVehicleIds([...selectedVehicleIds, id]);
    }
  };

  const handleBulkQuoteRequest = async () => {
    if (selectedVehicleIds.length === 0) {
      (window as any).showNotification?.("Lütfen en az bir araç seçin.", "error");
      return;
    }
    await onRequestBulkQuote(selectedVehicleIds);
    setSelectedVehicleIds([]);
  };

  const handleBulkPdfDownload = () => {
    if (selectedVehicleIds.length === 0) {
      (window as any).showNotification?.("Lütfen en az bir araç seçin.", "error");
      return;
    }
    (window as any).showNotification?.(`${selectedVehicleIds.length} aracın poliçeleri toplu olarak PDF (.zip) şeklinde indiriliyor...`, "info");
  };

  const handleExcelImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      (window as any).showNotification?.("Lütfen bir Excel/CSV dosyası seçin.", "error");
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // Create 3 mock imported vehicles
      const imported: Omit<Vehicle, 'id'>[] = [
        {
          plate: "34FLT101",
          brand: "Fiat",
          model: "Egea",
          year: 2024,
          bodyType: "Sedan",
          ownerId: "00000000-0000-0000-0000-000000000001",
          ownerName: "Ege Lojistik",
          ownerTcNo: "12345678901",
          inspectionStatus: "ZAMANIN VAR",
          insuranceStatus: "AKTIF",
          policyPremium: 9800
        },
        {
          plate: "34FLT102",
          brand: "Ford",
          model: "Transit",
          year: 2023,
          bodyType: "Van",
          ownerId: "00000000-0000-0000-0000-000000000001",
          ownerName: "Ege Lojistik",
          ownerTcNo: "12345678901",
          inspectionStatus: "MUAYENE DOLMAK ÜZERE",
          insuranceStatus: "AKTIF",
          policyPremium: 14500
        },
        {
          plate: "34FLT103",
          brand: "Skoda",
          model: "Octavia",
          year: 2025,
          bodyType: "Sedan",
          ownerId: "00000000-0000-0000-0000-000000000001",
          ownerName: "Ege Lojistik",
          ownerTcNo: "12345678901",
          inspectionStatus: "ZAMANIN VAR",
          insuranceStatus: "SİGORTA DOLDU",
          policyPremium: 11200
        }
      ];

      onAddVehicles(imported);
      setIsImporting(false);
      setIsExcelModalOpen(false);
      setExcelFile(null);
      (window as any).showNotification?.("Excel'den 3 yeni filo aracı başarıyla içe aktarıldı!", "success");
    }, 1500);
  };

  const getRiskColor = (score: number) => {
    if (score >= 85) return '#10b981'; // Green (Safe)
    if (score >= 60) return '#f59e0b'; // Amber (Moderate)
    return '#ef4444'; // Red (High Risk)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Header and Quick Actions */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--color-deep-twilight)' }}>Filo Yönetimi</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Kurumsal araç grupları, zimmet takip ve finansal risk paneli</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsExcelModalOpen(true)}>
            <i className="fa-solid fa-file-excel" style={{ marginRight: '6px' }}></i> Excel/CSV Yükle
          </button>
        </div>
      </section>

      {/* Sub-Fleets Cards row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {SUB_FLEETS.map(f => {
          const isSelected = selectedSubFleet === f.id;
          const count = vehicles.map(v => getDriverInfo(v.plate)).filter(d => f.id === 'all' || d.subFleetId === f.id).length;
          
          return (
            <div 
              key={f.id}
              onClick={() => setSelectedSubFleet(f.id)}
              className="glass-panel"
              style={{
                padding: '20px',
                background: '#fff',
                cursor: 'pointer',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--color-bright-teal)' : '1px solid var(--border-color)',
                boxShadow: isSelected ? '0 10px 25px -5px rgba(0, 119, 182, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.01)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{f.manager}</span>
                <span style={{ background: isSelected ? 'var(--color-light-cyan)' : '#f1f5f9', color: isSelected ? 'var(--color-bright-teal)' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  {count} Arac
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginTop: '8px', marginBottom: '12px' }}>{f.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>Maliyet: <strong>{f.annualCost.toLocaleString('tr-TR')} ₺</strong></span>
                <span>Risk: <strong style={{ color: f.lossRatio > 50 ? '#ef4444' : '#10b981' }}>%{f.lossRatio} LR</strong></span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Metrics Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Yıllık Filo Maliyeti</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--color-deep-twilight)' }}>{totalCost.toLocaleString('tr-TR')} ₺</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Araç Başı Ortalama Prim</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--color-bright-teal)' }}>{avgPremium.toLocaleString('tr-TR')} ₺</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            <span>Hasar / Prim Oranı (Loss Ratio)</span>
            <span style={{ color: avgLossRatio > 50 ? '#ef4444' : '#10b981', fontWeight: 700 }}>%{avgLossRatio}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${avgLossRatio}%`, height: '100%', background: avgLossRatio > 50 ? '#ef4444' : '#10b981', borderRadius: '4px' }}></div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Kritik Riskli Araç Sayısı</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>{criticalCount} Araç</div>
        </div>
      </section>

      {/* Vehicles Table & Bulk operations */}
      <section className="glass-panel" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.1rem', fontWeight: 700 }}>Araç Listesi & Sürücü Zimmetleri</h3>
          {selectedVehicleIds.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkPdfDownload}>
                <i className="fa-solid fa-file-zipper"></i> Toplu PDF İndir ({selectedVehicleIds.length})
              </button>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkQuoteRequest}>
                <i className="fa-solid fa-tags"></i> Toplu Teklif Al ({selectedVehicleIds.length})
              </button>
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0} 
                  />
                </th>
                <th>Plaka</th>
                <th>Araç Detayı</th>
                <th>Sürücü</th>
                <th>Sürücü Risk Skoru</th>
                <th>Sigorta Durumu</th>
                <th>Muayene Durumu</th>
                <th>Zimmet Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Seçilen şubeye ait araç bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(v => {
                  const isChecked = selectedVehicleIds.includes(v.id);
                  return (
                    <tr key={v.id} style={{ backgroundColor: isChecked ? 'rgba(0, 119, 182, 0.02)' : 'transparent' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleSelectVehicle(v.id)} 
                        />
                      </td>
                      <td>
                        <div className="plate-badge" style={{ display: 'inline-block' }}>{v.plate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.brand} {v.model}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{v.year} model</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{v.driver.name}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: getRiskColor(v.driver.riskScore) 
                          }}></span>
                          <span style={{ fontWeight: 700, color: getRiskColor(v.driver.riskScore) }}>{v.driver.riskScore}/100</span>
                        </div>
                      </td>
                      <td>
                        {renderStatusBadge(v.insuranceStatus)}
                      </td>
                      <td>
                        {renderStatusBadge(v.inspectionStatus)}
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{v.driver.zimmetDate}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Excel / CSV Import Modal */}
      {isExcelModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Excel/CSV ile Toplu Araç Ekle</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsExcelModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleExcelImport} style={{ padding: '24px' }}>
              <div 
                style={{ 
                  border: '2px dashed var(--color-bright-teal)', 
                  borderRadius: '10px', 
                  padding: '30px', 
                  textAlign: 'center', 
                  backgroundColor: 'var(--color-light-cyan)',
                  marginBottom: '20px',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-file-arrow-up" style={{ fontSize: '36px', color: 'var(--color-bright-teal)', marginBottom: '12px' }}></i>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-twilight)', margin: 0 }}>Dosyayı sürükleyin veya göz atın</p>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Desteklenenler: .xlsx, .csv (Maks. 5MB)</span>
                <input 
                  type="file" 
                  accept=".xlsx, .csv" 
                  onChange={e => setExcelFile(e.target.files ? e.target.files[0] : null)}
                  style={{ display: 'block', margin: '15px auto 0', fontSize: '12px' }}
                />
              </div>

              {excelFile && (
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span><i className="fa-solid fa-file-excel" style={{ color: '#10b981', marginRight: '6px' }}></i> {excelFile.name}</span>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => setExcelFile(null)}>Kaldır</button>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isImporting || !excelFile}
              >
                {isImporting ? "İçerik Aktarılıyor..." : "Yükle ve Aktar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedVehicleIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          color: '#fff',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { transform: translate(-50%, 100px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '24px', 
              height: '24px', 
              background: 'var(--color-bright-teal)', 
              color: '#fff', 
              borderRadius: '50%', 
              fontSize: '12px',
              fontWeight: 700
            }}>
              {selectedVehicleIds.length}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Araç Seçildi</span>
          </div>
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={handleBulkQuoteRequest}>
              <i className="fa-solid fa-tags" style={{ marginRight: '6px' }}></i> Toplu Teklif İste
            </button>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} onClick={handleBulkPdfDownload}>
              <i className="fa-solid fa-file-zipper" style={{ marginRight: '6px' }}></i> Toplu PDF İndir (.ZIP)
            </button>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: 'transparent', color: '#cbd5e1', border: 'none' }} onClick={() => {
              setIsDeptModalOpen(true);
            }}>
              <i className="fa-solid fa-right-left" style={{ marginRight: '6px' }}></i> Departman Değiştir
            </button>
          </div>
        </div>
      )}

      {/* Department Transfer Selection Modal */}
      {isDeptModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="glass-panel" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Filo / Departman Değiştir</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setIsDeptModalOpen(false)}>&times;</button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Seçili <strong>{selectedVehicleIds.length}</strong> araç için yeni bir şube/departman atayın:
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Hedef Departman</label>
                <select 
                  value={targetDeptId}
                  onChange={e => setTargetDeptId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: '#fff',
                    color: 'var(--color-deep-twilight)',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  {SUB_FLEETS.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={() => setIsDeptModalOpen(false)}
                >
                  İptal
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const deptName = SUB_FLEETS.find(f => f.id === targetDeptId)?.name || 'Bilinmeyen';
                    (window as any).showNotification?.(`${selectedVehicleIds.length} araç başarıyla "${deptName}" departmanına transfer edildi!`, "success");
                    setIsDeptModalOpen(false);
                    setSelectedVehicleIds([]);
                  }}
                >
                  Transferi Tamamla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
