import type { Vehicle } from '../../types';

interface InspectionsViewProps {
  vehicles: Vehicle[];
  GATEWAY_URL: string;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({ vehicles, GATEWAY_URL }) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ZAMANIN VAR':
      case 'MUAYENE ZAMANIN VAR':
        return <span className="badge badge-zamanin-var">GEÇERLİ</span>;
      case 'MUAYENE DOLMAK ÜZERE':
        return <span className="badge badge-dolmak-uzere">DOLMAK ÜZERE</span>;
      case 'MUAYENE DOLDU':
        return <span className="badge badge-doldu">SÜRESİ DOLDU</span>;
      default:
        return <span className="badge" style={{ background: '#e2e8f0', color: '#64748b' }}>MUAYENE YOK</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.2rem', fontWeight: 700 }}>
          Araç Muayene Takip ve Kayıtları
        </h3>
      </div>

      <div className="table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Plaka</th>
              <th>Araç Detayı</th>
              <th>Muayene Kaydı</th>
              <th>Muayene Sonucu</th>
              <th>Son Muayene Tarihi</th>
              <th>Kalan Süre</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>Muayene Belgesi</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>
                  <div className="plate-badge" style={{ display: 'inline-block' }}>{v.plate}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)' }}>{v.brand} {v.model}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{v.year} model</div>
                </td>
                <td>
                  {v.inspectionDate ? (
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
                      <i className="fa-solid fa-circle-check"></i> Kayıtlı
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: '13px' }}>
                      <i className="fa-solid fa-circle-xmark"></i> Kayıt Yok
                    </span>
                  )}
                </td>
                <td>
                  {v.inspectionDate ? (
                    v.inspectionPassed !== false ? (
                      <span className="badge" style={{ background: '#ecfdf5', color: '#047857' }}>GEÇTİ</span>
                    ) : (
                      <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>KALDI</span>
                    )
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                    {v.inspectionDate ? new Date(v.inspectionDate).toLocaleDateString('tr-TR') : '-'}
                  </div>
                </td>
                <td>
                  {v.inspectionRemainingDays !== undefined ? (
                    <span style={{ fontWeight: 600, color: v.inspectionRemainingDays < 30 ? '#ef4444' : '#334155', fontSize: '13px' }}>
                      {v.inspectionRemainingDays} gün kaldı
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>{getStatusBadge(v.inspectionStatus)}</td>
                <td style={{ textAlign: 'right' }}>
                  {v.inspectionDocumentUrl ? (
                    <a 
                      href={`${GATEWAY_URL}${v.inspectionDocumentUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      title="Muayene Raporunu İndir"
                    >
                      <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i> Belge
                    </a>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Belge Yok</span>
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
