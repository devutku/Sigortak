import React from 'react';
import type { Vehicle } from '../../types';

interface VehiclesViewProps {
  filteredVehicles: Vehicle[];
  activeFilter: 'active' | 'archived';
  setActiveFilter: (filter: 'active' | 'archived') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  setIsVehicleModalOpen: (open: boolean) => void;
  setRenewVehicleId: (id: string) => void;
  setRenewPolicyNo: (no: string) => void;
  setIsRenewModalOpen: (open: boolean) => void;
  setSelectedVehicleId: (id: string) => void;
  setIsPolicyModalOpen: (open: boolean) => void;
  setDetailVehicle: (vehicle: Vehicle | null) => void;
  loading: boolean;
  GATEWAY_URL: string;
  getStatusBadge: (status?: string) => React.ReactNode;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  filteredVehicles,
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  setIsVehicleModalOpen,
  setRenewVehicleId,
  setRenewPolicyNo,
  setIsRenewModalOpen,
  setSelectedVehicleId,
  setIsPolicyModalOpen,
  setDetailVehicle,
  loading,
  GATEWAY_URL,
  getStatusBadge
}) => {
  return (
    <>
      <section className="action-bar" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Arsivlenmis
          </button>
        </div>

        <div className="search-and-buttons">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Plaka, marka, model, Sase No ile ara..." 
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
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>Yeni Arac Ekle
          </button>
        </div>
      </section>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
      ) : viewMode === 'list' ? (
        <div className="table-container" style={{ marginTop: '20px' }}>
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Plaka</th>
                <th>Arac Bilgisi</th>
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
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Sase No: {v.ownerId.slice(0, 10)}...</div>
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
                          + Police Ekle
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {filteredVehicles.map(v => (
            <div 
              key={v.id} 
              onClick={() => setDetailVehicle(v)}
              className="glass-panel"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="plate-badge">{v.plate}</div>
                {getStatusBadge(v.insuranceStatus)}
              </div>

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

              {v.policyId ? (
                <div style={{ background: 'var(--badge-zamanin-var-bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.policyNumber}</div>
                    <div style={{ color: '#64748b', marginTop: '2px' }}>{v.insuranceRemainingDays} gün kaldi</div>
                  </div>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: '20px', color: 'var(--color-bright-teal)' }}></i>
                </div>
              ) : (
                <div style={{ background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#991b1b', fontWeight: 500 }}>Aktif police yok</span>
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '16px', color: '#dc2626' }}></i>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
