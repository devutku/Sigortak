import React from 'react';
import { Vehicle } from '../../types';

interface InspectionsViewProps {
  vehicles: Vehicle[];
  GATEWAY_URL: string;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({ vehicles, GATEWAY_URL }) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ZAMANIN VAR':
      case 'MUAYENE ZAMANIN VAR':
        return <span className="status-badge status-success">GECERLI</span>;
      case 'MUAYENE DOLMAK ÜZERE':
        return <span className="status-badge status-warning">DOLMAK ÜZERE</span>;
      case 'MUAYENE DOLDU':
        return <span className="status-badge status-danger">SÜRESİ DOLDU</span>;
      default:
        return <span className="status-badge status-neutral">MUAYENE YOK</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.2rem', fontWeight: 700 }}>
          Arac Muayene Takip ve Kayitlari
        </h3>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Plaka</th>
              <th>Arac Detayi</th>
              <th>Muayene Kaydi Var mi?</th>
              <th>Muayeneden Gecti mi?</th>
              <th>Son Muayene Tarihi</th>
              <th>Kalan Süre</th>
              <th>Durum</th>
              <th>Muayene Belgesi</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td><strong>{v.plate}</strong></td>
                <td>{v.brand} {v.model} ({v.year})</td>
                <td>
                  {v.inspectionDate ? (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-check"></i> Evet
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-xmark"></i> Hayir
                    </span>
                  )}
                </td>
                <td>
                  {v.inspectionDate ? (
                    v.inspectionPassed !== false ? (
                      <span className="status-badge status-success">GECTI</span>
                    ) : (
                      <span className="status-badge status-danger">KALDI</span>
                    )
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>{v.inspectionDate ? new Date(v.inspectionDate).toLocaleDateString('tr-TR') : '-'}</td>
                <td>
                  {v.inspectionRemainingDays !== undefined ? (
                    <span style={{ fontWeight: 600, color: v.inspectionRemainingDays < 30 ? '#ef4444' : '#334155' }}>
                      {v.inspectionRemainingDays} gün kaldi
                    </span>
                  ) : '-'}
                </td>
                <td>{getStatusBadge(v.inspectionStatus)}</td>
                <td>
                  {v.inspectionDocumentUrl ? (
                    <a 
                      href={`${GATEWAY_URL}${v.inspectionDocumentUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#ef4444', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                      title="Muayene Raporunu Indir"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Muayene Belgesi
                    </a>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Kayit Yok</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
