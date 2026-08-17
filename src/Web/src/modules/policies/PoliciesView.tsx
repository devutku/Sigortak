import React from 'react';
import { Vehicle } from '../../types';

interface PoliciesViewProps {
  vehicles: Vehicle[];
  onOpenPolicyModal: (vehicleId: string) => void;
  onOpenRenewModal: (vehicleId: string, policyNumber: string) => void;
  GATEWAY_URL: string;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  vehicles,
  onOpenPolicyModal,
  onOpenRenewModal,
  GATEWAY_URL
}) => {
  const vehiclesWithPolicies = vehicles.filter(v => v.policyId);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'AKTIF':
      case 'SIGORTA AKTIF':
        return <span className="status-badge status-success">AKTIF</span>;
      case 'SIGORTA DOLMAK ÜZERE':
        return <span className="status-badge status-warning">DOLMAK ÜZERE</span>;
      case 'SIGORTA DOLDU':
        return <span className="status-badge status-danger">SÜRESİ DOLDU</span>;
      default:
        return <span className="status-badge status-neutral">BILGI YOK</span>;
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
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Plaka</th>
                <th>Arac Marka / Model</th>
                <th>Police No / SBM No</th>
                <th>Tür</th>
                <th>Baslangic / Bitis</th>
                <th>Prim</th>
                <th>Durum</th>
                <th>Belge</th>
                <th style={{ textAlign: 'right' }}>Islemler</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesWithPolicies.map(v => (
                <tr key={v.id}>
                  <td><strong>{v.plate}</strong></td>
                  <td>{v.brand} {v.model} ({v.year})</td>
                  <td>
                    <div><strong>{v.policyNumber}</strong></div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.sbmPolicyNumber || '-'}</div>
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
                    <div style={{ fontSize: '13px' }}>
                      {v.policyStartDate ? new Date(v.policyStartDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Bitis: {v.policyEndDate ? new Date(v.policyEndDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </td>
                  <td><strong>{v.policyPremium ? `${v.policyPremium.toLocaleString('tr-TR')} ₺` : '-'}</strong></td>
                  <td>{getStatusBadge(v.insuranceStatus)}</td>
                  <td>
                    {v.policyDocumentUrl ? (
                      <a 
                        href={`${GATEWAY_URL}${v.policyDocumentUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title="PDF Indir"
                        style={{ color: '#ef4444', fontSize: '18px' }}
                      >
                        <i className="fa-solid fa-file-pdf"></i>
                      </a>
                    ) : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => onOpenRenewModal(v.id, v.policyNumber || '')}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Yenile
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
