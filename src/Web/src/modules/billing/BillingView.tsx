import React, { useState, useEffect } from 'react';

interface BillingViewProps {
  vehicles: any[];
  GATEWAY_URL: string;
}

interface PolicyRecord {
  id: string;
  policyNumber: string;
  vehicleId: string;
  companyName: string;
  agencyCode: string;
  startDate: string;
  endDate: string;
  premium: number;
  netPremium: number;
  commission: number;
  isPaid: boolean;
  paymentDate: string | null;
  paymentNote: string;
  isActive: boolean;
}

export const BillingView: React.FC<BillingViewProps> = ({ vehicles, GATEWAY_URL }) => {
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${GATEWAY_URL}/api/v1/policies`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch (err) {
      console.error("Poliçe listesi alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleMarkPaid = async (policyId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${GATEWAY_URL}/api/v1/policies/${policyId}/mark-paid`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ note: "Manuel ödeme onayı" })
      });
      if (res.ok) {
        (window as any).showNotification?.("Ödeme durumu başarıyla güncellendi.", "success");
        fetchPolicies();
      } else {
        (window as any).showNotification?.("Hata oluştu: Ödeme durumu güncellenemedi.", "error");
      }
    } catch (err: any) {
      console.error("Ödeme güncelleme hatası:", err);
      (window as any).showNotification?.("Hata oluştu: " + err.message, "error");
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    const v = vehicles.find(x => x.id === vehicleId);
    return v ? { plate: v.plate, brand: v.brand, model: v.model, year: v.year } : { plate: '-', brand: '-', model: '-', year: '-' };
  };

  const filtered = policies.filter(p => {
    if (filter === 'paid') return p.isPaid;
    if (filter === 'unpaid') return !p.isPaid;
    return true;
  });

  const totalPremium = policies.reduce((sum, p) => sum + (p.premium || 0), 0);
  const totalCommission = policies.reduce((sum, p) => sum + (p.commission || 0), 0);
  const paidCount = policies.filter(p => p.isPaid).length;
  const unpaidCount = policies.filter(p => !p.isPaid).length;
  const paidTotal = policies.filter(p => p.isPaid).reduce((sum, p) => sum + (p.premium || 0), 0);
  const unpaidTotal = policies.filter(p => !p.isPaid).reduce((sum, p) => sum + (p.premium || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--color-deep-twilight)', margin: 0 }}>
            <i className="fa-solid fa-credit-card" style={{ marginRight: '10px', color: 'var(--color-bright-teal)' }}></i>
            Komisyon & Prim / Fatura Takibi
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Poliçe ödemelerini takip edin, komisyon gelirlerinizi izleyin
          </span>
        </div>
      </section>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
          borderRadius: '12px', color: '#fff', border: 'none'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600, marginBottom: '8px' }}>TOPLAM PRİM</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{totalPremium.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>{policies.length} poliçe</div>
        </div>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
          borderRadius: '12px', color: '#fff', border: 'none'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600, marginBottom: '8px' }}>TOPLAM KOMİSYON</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{totalCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>Acente komisyon geliri</div>
        </div>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
          borderRadius: '12px', color: '#fff', border: 'none'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600, marginBottom: '8px' }}>ÖDENMİŞ</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{paidTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>{paidCount} poliçe ödendi</div>
        </div>
        <div className="glass-panel" style={{
          padding: '20px', background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
          borderRadius: '12px', color: '#fff', border: 'none'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 600, marginBottom: '8px' }}>ÖDENMEMİŞ</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{unpaidTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>{unpaidCount} poliçe bekliyor</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['all', 'unpaid', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: filter === f ? '2px solid var(--color-bright-teal)' : '1px solid var(--border-color)',
              background: filter === f ? 'rgba(0,119,182,0.08)' : '#fff',
              color: filter === f ? 'var(--color-bright-teal)' : '#64748b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {f === 'all' ? `Tümü (${policies.length})` : f === 'paid' ? `Ödendi (${paidCount})` : `Ödenmedi (${unpaidCount})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--color-bright-teal)', marginBottom: '16px' }}></i>
            <p>Poliçe verileri yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-file-invoice" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ fontWeight: 600 }}>Bu filtreye uygun poliçe bulunamadı.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Sigorta Şirketi</th>
                  <th>Poliçe No</th>
                  <th>Vade</th>
                  <th>Ödenecek Tutar</th>
                  <th>Komisyon</th>
                  <th>Ödeme Durumu</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const vInfo = getVehicleInfo(p.vehicleId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="plate-badge" style={{ display: 'inline-block' }}>{vInfo.plate}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{vInfo.brand} {vInfo.model}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-deep-twilight)', fontSize: '13px' }}>{p.companyName || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Acente: {p.agencyCode || '-'}</div>
                      </td>
                      <td>
                        <strong>{p.policyNumber}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: '#334155' }}>
                          {new Date(p.startDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          → {new Date(p.endDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-bright-teal)', fontSize: '14px' }}>
                          {(p.premium || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: '#2d6a4f', fontWeight: 700, fontSize: '13px' }}>
                          {(p.commission || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </td>
                      <td>
                        {p.isPaid ? (
                          <div>
                            <span style={{
                              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                              background: 'rgba(22,163,74,0.1)', color: '#16a34a'
                            }}>
                              <i className="fa-solid fa-check-circle" style={{ marginRight: '4px' }}></i>ÖDENDİ
                            </span>
                            {p.paymentDate && (
                              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                {new Date(p.paymentDate).toLocaleDateString('tr-TR')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                            background: 'rgba(220,38,38,0.1)', color: '#dc2626'
                          }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i>ÖDENMEDİ
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!p.isPaid && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleMarkPaid(p.id)}
                            style={{ padding: '6px 14px', fontSize: '12px', background: '#16a34a', borderColor: '#16a34a' }}
                          >
                            <i className="fa-solid fa-check" style={{ marginRight: '4px' }}></i>Ödendi İşaretle
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
