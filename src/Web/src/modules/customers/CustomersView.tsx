import type { Vehicle } from '../../types';

interface CustomersViewProps {
  vehicles: Vehicle[];
  customerSearchTerm: string;
  setCustomerSearchTerm: (term: string) => void;
  loading: boolean;
  GATEWAY_URL: string;
  setRenewVehicleId: (id: string) => void;
  setRenewPolicyNo: (no: string) => void;
  setIsRenewModalOpen: (open: boolean) => void;
  setSelectedVehicleId: (id: string) => void;
  setIsPolicyModalOpen: (open: boolean) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  vehicles,
  customerSearchTerm,
  setCustomerSearchTerm,
  loading,
  GATEWAY_URL,
  setRenewVehicleId,
  setRenewPolicyNo,
  setIsRenewModalOpen,
  setSelectedVehicleId,
  setIsPolicyModalOpen
}) => {
  const groups: { [name: string]: Vehicle[] } = {};
  vehicles.forEach(v => {
    const owner = v.ownerName || 'Bilinmeyen Müsteri';
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
      <section className="action-bar" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
          Müsteri Listesi
        </div>

        <div className="search-and-buttons" style={{ marginLeft: 'auto' }}>
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Müşteri adı veya plaka ile ara..." 
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
          <p>Müsteri bulunamadi.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
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
                      <span style={{ fontSize: '12px', color: '#64748b' }}><i className="fa-solid fa-car" style={{ marginRight: '4px' }}></i>Toplam Arac: {customer.vehicles.length}</span>
                      {customer.vehicles[0]?.ownerAddress && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{customer.vehicles[0].ownerAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="plate-badge" style={{ fontSize: '0.95rem', padding: '3px 10px' }}>{v.plate}</div>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--color-deep-twilight)', fontSize: '0.95rem' }}>{v.year} {v.brand} {v.model}</span>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>({v.bodyType || 'Sedan'})</span>
                        </div>
                      </div>

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
                              <i className="fa-solid fa-arrows-rotate"></i> Police Yenile
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
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '12px',
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px dashed #e2e8f0'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Sasi Numarasi</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)', fontFamily: 'monospace' }}>{v.chassisNumber || 'Belirtilmemis'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Ruhsat Numarasi</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.registrationNumber || 'Belirtilmemis'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Motor (Hacim / No)</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>
                          {v.engineCapacity ? `${v.engineCapacity}L` : '-'} / {v.engineNumber || '-'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Kullanim / Tescil</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-twilight)' }}>
                          {v.usageType || '-'} {v.trafficRegistrationDate ? `(${new Date(v.trafficRegistrationDate).toLocaleDateString('tr-TR')})` : ''}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Aktif Police Durumu</span>
                        {v.policyId ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                              <i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i>
                              {v.policyNumber} ({v.insuranceRemainingDays} gün kaldi)
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
                            Police Yok
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
};
