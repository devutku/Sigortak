import React from 'react';
import type { Vehicle } from '../../types';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenRenewModal: (vehicleId: string, policyNumber: string) => void;
  onOpenCreatePolicyModal: (vehicleId: string) => void;
  gatewayUrl: string;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onOpenRenewModal,
  onOpenCreatePolicyModal,
  gatewayUrl
}) => {
  if (!vehicle) return null;

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="badge badge-zamanin-var" style={{ background: '#e2e8f0', color: '#64748b' }}>BELİRSİZ</span>;
    if (status === 'ZAMANIN VAR' || status === 'MUAYENE ZAMANIN VAR') {
      return <span className="badge badge-zamanin-var">ZAMANIN VAR</span>;
    }
    if (status === 'MUAYENE DOLMAK ÜZERE' || status === 'SİGORTA DOLMAK ÜZERE') {
      return <span className="badge badge-dolmak-uzere">DOLMAK ÜZERE</span>;
    }
    return <span className="badge badge-doldu">DOLDU</span>;
  };

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 94, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div 
        style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ background: 'var(--color-deep-twilight)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="plate-badge">{vehicle.plate}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Araç Detayı</h3>
          </div>
          <button 
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '8px' }}>
            {vehicle.year} {vehicle.brand} {vehicle.model}
          </h4>

          {!vehicle.inspectionDate && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#b91c1c'
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px', marginTop: '2px' }}></i>
              <div>
                <strong style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>UYUMLULUK (COMPLIANCE) UYARISI: Muayene Girilmedi!</strong>
                <span style={{ fontSize: '12px', lineHeight: '1.4', display: 'block', opacity: 0.9 }}>
                  Bu aracın geçerli bir TÜVTÜRK muayenesi bulunmamaktadır. Kasko ve hasar ödemelerinde ret veya rücu riski, ayrıca sahada trafikten men ve ceza alma riski bulunmaktadır.
                </span>
              </div>
            </div>
          )}

          {/* Owner Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Araç Sahibi</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{vehicle.ownerName || 'Bilinmiyor'}</span>
            </div>
            {vehicle.ownerTcNo && (
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>T.C. Kimlik No</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{vehicle.ownerTcNo}</span>
              </div>
            )}
          </div>

          {/* Technical Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--color-bright-teal)' }}></i>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Muayene Durumu</span>
              </div>
              {vehicle.inspectionDate ? getStatusBadge(vehicle.inspectionStatus) : <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700 }}>MUAYENE GİRİLMEDİ</span>}
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                {vehicle.inspectionDate && vehicle.inspectionRemainingDays !== undefined ? `${vehicle.inspectionRemainingDays} gün kaldı` : 'Kayıt Yok'}
              </div>
              {vehicle.inspectionDate && (
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Son Muayene: {new Date(vehicle.inspectionDate).toLocaleDateString('tr-TR')}</div>
              )}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-bright-teal)' }}></i>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sigorta Durumu</span>
              </div>
              {getStatusBadge(vehicle.insuranceStatus)}
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                {vehicle.insuranceRemainingDays !== undefined ? `${vehicle.insuranceRemainingDays} gün kaldı` : 'Bilgi yok'}
              </div>
              {vehicle.insuranceEndDate && (
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Bitiş: {new Date(vehicle.insuranceEndDate).toLocaleDateString('tr-TR')}</div>
              )}
            </div>
          </div>

          {/* Policy Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-deep-twilight)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-file-contract" style={{ color: 'var(--color-bright-teal)' }}></i>
              Poliçe Bilgileri
            </h3>

            {vehicle.policyId ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', width: '40%', borderBottom: '1px solid var(--border-color)' }}>Poliçe No</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-deep-twilight)', borderBottom: '1px solid var(--border-color)' }}>{vehicle.policyNumber}</td>
                    </tr>
                    {vehicle.sbmPolicyNumber && (
                      <tr>
                        <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>SBM Poliçe No</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-deep-twilight)', borderBottom: '1px solid var(--border-color)' }}>{vehicle.sbmPolicyNumber}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>Başlangıç Tarihi</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{vehicle.policyStartDate ? new Date(vehicle.policyStartDate).toLocaleDateString('tr-TR') : '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b', borderBottom: '1px solid var(--border-color)' }}>Bitiş Tarihi</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{vehicle.policyEndDate ? new Date(vehicle.policyEndDate).toLocaleDateString('tr-TR') : '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#64748b' }}>Prim Tutarı</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-bright-teal)' }}>{vehicle.policyPremium?.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ border: '1px dashed #e2e8f0', borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                Bu araca henüz bir poliçe tanımlanmamıştır.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {vehicle.policyId ? (
              <>
                {vehicle.policyDocumentUrl && (
                  <a
                    href={`${gatewayUrl}${vehicle.policyDocumentUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f1f5f9', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i> Poliçe PDF
                  </a>
                )}
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px' }}
                  onClick={() => onOpenRenewModal(vehicle.id, vehicle.policyNumber || '')}
                >
                  <i className="fa-solid fa-arrows-rotate"></i> Poliçeyi Yenile
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px' }}
                onClick={() => onOpenCreatePolicyModal(vehicle.id)}
              >
                <i className="fa-solid fa-plus"></i> Yeni Poliçe Tanımla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
