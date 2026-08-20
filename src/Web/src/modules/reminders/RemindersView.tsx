import React, { useState } from 'react';

interface RemindersViewProps {
  vehicles: any[];
  onOpenRenewModal: (vehicleId: string, policyNumber: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ vehicles, onOpenRenewModal }) => {
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring'>('all');

  const now = new Date();

  const vehiclesWithPolicies = vehicles
    .filter(v => v.policyId && v.policyEndDate)
    .map(v => {
      const endDate = new Date(v.policyEndDate);
      const diffMs = endDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let status: 'expired' | 'expiring' | 'safe';
      if (remainingDays <= 0) status = 'expired';
      else if (remainingDays <= 30) status = 'expiring';
      else status = 'safe';

      return { ...v, remainingDays, status };
    })
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const expiredCount = vehiclesWithPolicies.filter(v => v.status === 'expired').length;
  const expiringCount = vehiclesWithPolicies.filter(v => v.status === 'expiring').length;
  const safeCount = vehiclesWithPolicies.filter(v => v.status === 'safe').length;

  const filtered = vehiclesWithPolicies.filter(v => {
    if (filter === 'expired') return v.status === 'expired';
    if (filter === 'expiring') return v.status === 'expiring';
    return true;
  });

  const getStatusBadge = (status: string, remainingDays: number) => {
    if (status === 'expired') {
      return (
        <span style={{
          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(220,38,38,0.1)', color: '#dc2626'
        }}>
          <i className="fa-solid fa-exclamation-triangle" style={{ marginRight: '4px' }}></i>
          SÜRESİ DOLDU ({Math.abs(remainingDays)} gün önce)
        </span>
      );
    }
    if (status === 'expiring') {
      return (
        <span style={{
          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(234,179,8,0.1)', color: '#ca8a04'
        }}>
          <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i>
          {remainingDays} gün kaldı
        </span>
      );
    }
    return (
      <span style={{
        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
        background: 'rgba(22,163,74,0.1)', color: '#16a34a'
      }}>
        <i className="fa-solid fa-shield-check" style={{ marginRight: '4px' }}></i>
        {remainingDays} gün kaldı
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--color-deep-twilight)', margin: 0 }}>
            <i className="fa-solid fa-envelope-open-text" style={{ marginRight: '10px', color: 'var(--color-bright-teal)' }}></i>
            Otomatik Vade Hatırlatıcıları
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Vadesi dolan ve dolmak üzere olan poliçeleri takip edin
          </span>
        </div>
      </section>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
          borderRadius: '12px', color: '#fff', border: 'none', cursor: 'pointer',
          transform: filter === 'expired' ? 'scale(1.02)' : 'none',
          boxShadow: filter === 'expired' ? '0 8px 25px rgba(220,38,38,0.3)' : 'none',
          transition: 'all 0.2s ease'
        }} onClick={() => setFilter('expired')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-exclamation-circle" style={{ fontSize: '28px', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600 }}>KRİTİK — Süresi Dolmuş</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{expiredCount}</div>
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #ca8a04 0%, #fbbf24 100%)',
          borderRadius: '12px', color: '#fff', border: 'none', cursor: 'pointer',
          transform: filter === 'expiring' ? 'scale(1.02)' : 'none',
          boxShadow: filter === 'expiring' ? '0 8px 25px rgba(234,179,8,0.3)' : 'none',
          transition: 'all 0.2s ease'
        }} onClick={() => setFilter('expiring')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '28px', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600 }}>UYARI — 30 Gün İçinde</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{expiringCount}</div>
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
          borderRadius: '12px', color: '#fff', border: 'none', cursor: 'pointer',
          transform: filter === 'all' ? 'scale(1.02)' : 'none',
          boxShadow: filter === 'all' ? '0 8px 25px rgba(22,163,74,0.3)' : 'none',
          transition: 'all 0.2s ease'
        }} onClick={() => setFilter('all')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: '28px', opacity: 0.9 }}></i>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600 }}>GÜVENLİ</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{safeCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-calendar-check" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>
              {filter === 'expired' ? 'Süresi dolmuş poliçe yok — Harika!' :
               filter === 'expiring' ? '30 gün içinde dolacak poliçe yok.' :
               'Kayıtlı poliçe bulunamadı.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Araç Detayı</th>
                  <th>Poliçe No</th>
                  <th>Poliçe Bitiş</th>
                  <th>Kalan Gün</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} style={{
                    background: v.status === 'expired' ? 'rgba(220,38,38,0.03)' :
                                v.status === 'expiring' ? 'rgba(234,179,8,0.03)' : 'transparent'
                  }}>
                    <td>
                      <div className="plate-badge" style={{ display: 'inline-block' }}>{v.plate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)', fontSize: '13px' }}>{v.brand} {v.model}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{v.year} model</div>
                    </td>
                    <td>
                      <strong>{v.policyNumber || '-'}</strong>
                    </td>
                    <td>
                      <div style={{
                        fontSize: '13px', fontWeight: 600,
                        color: v.status === 'expired' ? '#dc2626' : v.status === 'expiring' ? '#ca8a04' : '#334155'
                      }}>
                        {new Date(v.policyEndDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        fontSize: '15px', fontWeight: 800,
                        color: v.status === 'expired' ? '#dc2626' : v.status === 'expiring' ? '#ca8a04' : '#16a34a'
                      }}>
                        {v.remainingDays <= 0 ? `${Math.abs(v.remainingDays)} gün geçmiş` : `${v.remainingDays} gün`}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(v.status, v.remainingDays)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(v.status === 'expired' || v.status === 'expiring') && (
                        <button
                          className="btn btn-primary"
                          onClick={() => onOpenRenewModal(v.id, v.policyNumber || '')}
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                          <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '4px' }}></i>
                          Yenile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
