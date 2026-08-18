import type { Vehicle } from '../../types';

interface PoliciesViewProps {
  vehicles: Vehicle[];
  onOpenRenewModal: (vehicleId: string, policyNumber: string) => void;
  GATEWAY_URL: string;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  vehicles,
  onOpenRenewModal,
  GATEWAY_URL
}) => {
  const vehiclesWithPolicies = vehicles.filter(v => v.policyId);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'AKTIF':
      case 'SIGORTA AKTIF':
        return <span className="badge badge-zamanin-var">AKTIF</span>;
      case 'SIGORTA DOLMAK ÜZERE':
        return <span className="badge badge-dolmak-uzere">DOLMAK ÜZERE</span>;
      case 'SIGORTA DOLDU':
        return <span className="badge badge-doldu">SÜRESİ DOLDU</span>;
      default:
        return <span className="badge" style={{ background: '#e2e8f0', color: '#64748b' }}>BILGI YOK</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.2rem', fontWeight: 700 }}>
          Kasko ve Trafik Policeleri
        </h3>
      </div>

      {vehiclesWithPolicies.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
          <i className="fa-solid fa-file-invoice" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <p style={{ fontSize: '15px', fontWeight: 600 }}>Sistemde kayitli aktif sigorta policesi bulunmamaktadir.</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Arac detayindan yeni police olusturabilir veya teklif satin alarak otomatik police üretebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Plaka</th>
                <th>Arac Detayi</th>
                <th>Police No / SBM No</th>
                <th>Tür</th>
                <th>Süreç (Baslangic / Bitis)</th>
                <th>Prim</th>
                <th>Durum</th>
                <th>Belge</th>
                <th style={{ textAlign: 'right' }}>Islemler</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesWithPolicies.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="plate-badge" style={{ display: 'inline-block' }}>{v.plate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.brand} {v.model}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{v.year} model</div>
                  </td>
                  <td>
                    <div><strong>{v.policyNumber}</strong></div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>SBM: {v.sbmPolicyNumber || '-'}</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      background: v.sbmPolicyNumber ? 'rgba(0,119,182,0.1)' : 'rgba(100,116,139,0.1)', 
                      color: v.sbmPolicyNumber ? 'var(--color-bright-teal)' : '#64748b' 
                    }}>
                      Kasko / Trafik
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#334155' }}>
                      {v.policyStartDate ? new Date(v.policyStartDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Bitis: {v.policyEndDate ? new Date(v.policyEndDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </td>
                  <td><strong style={{ color: 'var(--color-bright-teal)' }}>{v.policyPremium ? `${v.policyPremium.toLocaleString('tr-TR')} ₺` : '-'}</strong></td>
                  <td>{getStatusBadge(v.insuranceStatus)}</td>
                  <td>
                    {v.policyDocumentUrl ? (
                      <a 
                        href={`${GATEWAY_URL}${v.policyDocumentUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title="PDF Indir"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i> Belge
                      </a>
                    ) : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => onOpenRenewModal(v.id, v.policyNumber || '')}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '4px' }}></i> Yenile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
