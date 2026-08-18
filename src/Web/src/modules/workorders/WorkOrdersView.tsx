import React from 'react';

interface WorkOrdersViewProps {
  workOrders: any[];
  setIsWorkOrderModalOpen: (open: boolean) => void;
  handlePrintWorkOrder: (wo: any) => void;
  handleUpdateWorkOrderStatus: (id: string, status: number) => Promise<void>;
  loading: boolean;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  setIsWorkOrderModalOpen,
  handlePrintWorkOrder,
  handleUpdateWorkOrderStatus,
  loading
}) => {
  return (
    <>
      <section className="action-bar" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>
          Operasyonel Is Emirleri (Hasar & Kaza Kayitlari)
        </div>

        <button className="btn btn-primary" onClick={() => setIsWorkOrderModalOpen(true)} style={{ marginLeft: 'auto' }}>
          <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>Yeni Is Emri Ekle
        </button>
      </section>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
      ) : workOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <i className="fa-solid fa-file-invoice" style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}></i>
          <p>Kayitli is emri bulunamadi.</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '20px' }}>
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Is Emri No</th>
                <th>Baslik</th>
                <th>Tür</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>Olusturulma Tarihi</th>
                <th style={{ textAlign: 'right' }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo: any) => (
                <tr key={wo.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-deep-twilight)' }}>{wo.orderNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{wo.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{wo.description}</div>
                    {wo.specialNotes && (
                      <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', marginTop: '4px' }}>Not: {wo.specialNotes}</div>
                    )}
                  </td>
                  <td>
                    {(() => {
                      switch (wo.orderType) {
                        case 'ClaimFile': return <span className="badge" style={{ background: '#ffedd5', color: '#ea580c' }}>Hasar Dosyasi Açma</span>;
                        case 'ExpertAssignment': return <span className="badge" style={{ background: '#dbeafe', color: '#2563eb' }}>Eksper Atama</span>;
                        case 'PolicyRenewal': return <span className="badge" style={{ background: '#d1fae5', color: '#059669' }}>Police Yenileme</span>;
                        case 'CollectionAndCancellation': return <span className="badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>Tahsilat & Iptal</span>;
                        default: return <span className="badge">{wo.orderType}</span>;
                      }
                    })()}
                  </td>
                  <td>
                    {(() => {
                      switch (wo.priority) {
                        case 'Low': return <span style={{ color: '#64748b', fontWeight: 600 }}>Düsük</span>;
                        case 'Medium': return <span style={{ color: '#d97706', fontWeight: 600 }}>Orta</span>;
                        case 'High': return <span style={{ color: '#dc2626', fontWeight: 600 }}>Yüksek</span>;
                        case 'Critical': return <span style={{ color: '#7f1d1d', fontWeight: 700, textTransform: 'uppercase' }}>⚠️ Kritik</span>;
                        default: return <span>{wo.priority}</span>;
                      }
                    })()}
                  </td>
                  <td>
                    {(() => {
                      switch (wo.status) {
                        case 'New': return <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>Yeni</span>;
                        case 'Assigned': return <span className="badge" style={{ background: '#faf5ff', color: '#6d28d9' }}>Atandi</span>;
                        case 'InProgress': return <span className="badge" style={{ background: '#fffbeb', color: '#b45309' }}>Islemde</span>;
                        case 'Completed': return <span className="badge" style={{ background: '#ecfdf5', color: '#047857' }}>Tamamlandi</span>;
                        case 'Cancelled': return <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>Iptal Edildi</span>;
                        default: return <span className="badge">{wo.status}</span>;
                      }
                    })()}
                  </td>
                  <td>
                    {new Date(wo.createdAt).toLocaleDateString('tr-TR')} {new Date(wo.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handlePrintWorkOrder(wo)} 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }}
                        title="Yazdir / PDF Kaydet"
                      >
                        <i className="fa-solid fa-print"></i> Yazdir
                      </button>
                      {wo.status !== 'Completed' && wo.status !== 'Cancelled' && (
                        <>
                          <button 
                            onClick={() => handleUpdateWorkOrderStatus(wo.id, 3)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                            title="Isleme Al"
                          >
                            Islemde
                          </button>
                          <button 
                            onClick={() => handleUpdateWorkOrderStatus(wo.id, 4)} 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                            title="Tamamla"
                          >
                            Tamamla
                          </button>
                          <button 
                            onClick={() => handleUpdateWorkOrderStatus(wo.id, 5)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                            title="Iptal Et"
                          >
                            Iptal
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
