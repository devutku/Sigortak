import type { Quote } from '../../types';

interface QuotesViewProps {
  quotes: Quote[];
  onApproveQuote: (id: string) => Promise<void>;
  onRejectQuote: (id: string) => Promise<void>;
  GATEWAY_URL: string;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  onApproveQuote,
  onRejectQuote,
  GATEWAY_URL
}) => {
  const activeQuotes = quotes.filter(q => q.status === 0);

  const getRemainingHours = (dateStr: string) => {
    const end = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <section className="action-bar" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
          Sigorta Teklifleri & Karsilastirma
        </div>
      </section>

      {activeQuotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 0', textAlign: 'center', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: '56px', color: '#cbd5e1', marginBottom: '16px' }}></i>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Sistemde bekleyen aktif teklif bulunmamaktadir.</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Tüm teklifler onaylandi veya iptal edildi.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {activeQuotes.map(q => {
            const hoursLeft = getRemainingHours(q.validityDate);
            return (
              <div 
                key={q.id}
                className="glass-panel"
                style={{ 
                  background: '#fff', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: 'rgba(0,119,182,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
                      {q.insuranceCompany}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      Acente: {q.agentName}
                    </span>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    background: q.policyType === 1 ? 'rgba(0,119,182,0.1)' : 'rgba(248,150,30,0.1)', 
                    color: q.policyType === 1 ? 'var(--color-bright-teal)' : '#f8961e' 
                  }}>
                    {q.policyType === 1 ? 'KASKO' : 'TRAFIK'}
                  </span>
                </div>

                {/* Coverages Table */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Arac Plaka / Bilgi:</span>
                    <strong>{q.vehiclePlate} ({q.vehicleInfo})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>IMM Limiti:</span>
                    <strong>{q.immLimit || 'Belirtilmemis'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Ikame Arac:</span>
                    <strong>{q.replacementCar || 'Süre yok'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Muafiyet:</span>
                    <strong>{q.deductible || 'Yok'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Cam Teminati:</span>
                    <strong style={{ color: q.glassCoverage ? '#10b981' : '#ef4444' }}>
                      {q.glassCoverage ? 'Dahil' : 'Haric'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Asistans Paketi:</span>
                    <strong style={{ color: q.assistance ? '#10b981' : '#ef4444' }}>
                      {q.assistance ? 'Dahil' : 'Haric'}
                    </strong>
                  </div>

                  {q.documentUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <a 
                        href={`${GATEWAY_URL}${q.documentUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', width: '100%', fontSize: '12px', textDecoration: 'none', background: '#f8fafc', fontWeight: 600 }}
                      >
                        <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i> Teklif PDF Belgesi
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer and Price */}
                <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>GECERLILIK</div>
                      <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700 }}>
                        {hoursLeft} Saat kaldi
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOPLAM PRIM</div>
                      <div style={{ fontSize: '20px', color: 'var(--color-bright-teal)', fontWeight: 800 }}>
                        {q.premium.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => onRejectQuote(q.id)}
                      style={{ flex: 1, padding: '10px', fontSize: '13px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                    >
                      Reddet
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => onApproveQuote(q.id)}
                      style={{ flex: 2, padding: '10px', fontSize: '13px' }}
                    >
                      Satin Al
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
