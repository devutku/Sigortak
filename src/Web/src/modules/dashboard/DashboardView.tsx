import React, { useState } from 'react';
import type { Vehicle, Quote } from '../../types';

interface DashboardViewProps {
  vehicles: Vehicle[];
  quotes: Quote[];
  setActiveMenu: (menu: any) => void;
  onApproveQuote: (id: string) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  quotes,
  setActiveMenu,
  onApproveQuote
}) => {
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const activeQuotes = quotes.filter(q => q.status === 0);

  const getRemainingHours = (dateStr: string) => {
    const end = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60));
  };

  // Pie chart stats
  const zamaninVarCount = vehicles.filter(v => v.inspectionStatus === 'ZAMANIN VAR' || v.inspectionStatus === 'MUAYENE ZAMANIN VAR').length;
  const dolmakUzereCount = vehicles.filter(v => v.inspectionStatus === 'MUAYENE DOLMAK ÜZERE' || v.inspectionStatus === 'SİGORTA DOLMAK ÜZERE').length;
  const dolduCount = vehicles.filter(v => v.inspectionStatus === 'MUAYENE DOLDU' || v.inspectionStatus === 'SİGORTA DOLDU').length;
  const belirsizCount = vehicles.length - (zamaninVarCount + dolmakUzereCount + dolduCount);

  const totalInspect = vehicles.length || 1;
  const pZamaninVar = (zamaninVarCount / totalInspect) * 100;
  const pDolmakUzere = (dolmakUzereCount / totalInspect) * 100;
  const pDoldu = (dolduCount / totalInspect) * 100;

  const pieChartBackground = `conic-gradient(
    #0077b6 0% ${pZamaninVar}%,
    #f8961e ${pZamaninVar}% ${pZamaninVar + pDolmakUzere}%,
    #ef4444 ${pZamaninVar + pDolmakUzere}% ${pZamaninVar + pDolmakUzere + pDoldu}%,
    #64748b ${pZamaninVar + pDolmakUzere + pDoldu}% 100%
  )`;

  // Calendar calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthName = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getCalendarEvents = (day: number) => {
    return vehicles.filter(v => {
      if (!v.insuranceEndDate) return false;
      const date = new Date(v.insuranceEndDate);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth && date.getDate() === day;
    });
  };

  const getInspectionEvents = (day: number) => {
    return vehicles.filter(v => {
      if (!v.inspectionDate) return false;
      const date = new Date(v.inspectionDate);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth && date.getDate() === day;
    });
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--color-deep-twilight)' }}>Kontrol Paneli Özeti</h2>
      
      {/* Active Quotes Warning Notifications */}
      {activeQuotes.length > 0 && (
        <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeQuotes.map(q => {
            const hoursLeft = getRemainingHours(q.validityDate);
            return (
              <div 
                key={q.id}
                className="glass-panel" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 24px', 
                  borderLeft: '5px solid #10b981', 
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '20px' }}>🟢</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-deep-twilight)', fontSize: '15px' }}>
                      Yeni Teklif: {q.vehiclePlate} ({q.policyType === 1 ? 'Kasko' : 'Trafik'}) için {q.insuranceCompany} teklifi geldi
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Fiyat: <strong style={{ color: 'var(--color-bright-teal)' }}>{q.premium.toLocaleString('tr-TR')} ₺</strong> | 
                      Gecerlilik: <span style={{ color: '#ef4444', fontWeight: 600 }}>{hoursLeft} saat kaldi</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveMenu('quotes')}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Karsilastir
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onApproveQuote(q.id)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Satin Al
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Toplam Arac</div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--color-deep-twilight)' }}>{vehicles.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Aktif Police</div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--color-bright-teal)' }}>
            {vehicles.filter(v => v.policyId).length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Bekleyen Teklifler</div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: '#f8961e' }}>{activeQuotes.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Calendar Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.1rem', fontWeight: 700 }}>{currentMonthName} Takvimi</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Sigorta / Muayene Takibi</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
            <div>Pzt</div><div>Sal</div><div>Car</div><div>Per</div><div>Cum</div><div>Cmt</div><div>Paz</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`}></div>;

              const sigortaEvents = getCalendarEvents(day);
              const muayeneEvents = getInspectionEvents(day);
              const hasEvents = sigortaEvents.length > 0 || muayeneEvents.length > 0;
              const isSelected = selectedCalendarDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                  style={{
                    height: '55px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--color-bright-teal)' : '1px solid #f1f5f9',
                    backgroundColor: isSelected ? 'var(--color-light-cyan)' : hasEvents ? '#fffbeb' : '#f8fafc',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = hasEvents ? '#fffbeb' : '#f8fafc';
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--color-bright-teal)' : 'var(--color-deep-twilight)' }}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {sigortaEvents.length > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-bright-teal)' }} title="Police Bitis"></span>}
                      {muayeneEvents.length > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f8961e' }} title="Muayene"></span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Detail List */}
          {selectedCalendarDay && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '10px' }}>
                {selectedCalendarDay} {currentMonthName.split(' ')[0]} Günü Etkinlikleri
              </h4>
              {(() => {
                const sigorta = getCalendarEvents(selectedCalendarDay);
                const muayene = getInspectionEvents(selectedCalendarDay);
                if (sigorta.length === 0 && muayene.length === 0) {
                  return <div style={{ fontSize: '12px', color: '#64748b' }}>Bu güne ait yaklasan islem bulunmamaktadir.</div>;
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sigorta.map(v => (
                      <div key={v.id} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--color-bright-teal)' }}>●</span>
                        <strong>{v.plate}</strong> police bitis tarihi.
                      </div>
                    ))}
                    {muayene.map(v => (
                      <div key={v.id} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#f8961e' }}>●</span>
                        <strong>{v.plate}</strong> muayene bitis tarihi.
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Chart Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'var(--color-deep-twilight)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Sigorta & Muayene Durum Dagilimi</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', marginBottom: '24px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: pieChartBackground, position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#fff', top: '30px', left: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Araclar</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>{vehicles.length}</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#0077b6' }}></span>
                Muayenesi Var
              </span>
              <strong>{zamaninVarCount} Arac</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#f8961e' }}></span>
                Süresi Yaklasan
              </span>
              <strong>{dolmakUzereCount} Arac</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#ef4444' }}></span>
                Süresi Dolan
              </span>
              <strong style={{ color: '#ef4444' }}>{dolduCount} Arac</strong>
            </div>
            {belirsizCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#64748b' }}></span>
                  Bilgi Girilmemis
                </span>
                <strong>{belirsizCount} Arac</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
