import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../../types';
import { createWorkOrder } from '../../services/api';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSuccess: () => void;
  token: string;
  gatewayUrl: string;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSuccess,
  token,
  gatewayUrl
}) => {
  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [woType, setWoType] = useState("1");
  const [woPriority, setWoPriority] = useState("2");
  const [woRelatedEntityId, setWoRelatedEntityId] = useState("");
  const [woSpecialNotes, setWoSpecialNotes] = useState("");
  const [woSuccess, setWoSuccess] = useState("");
  const [woError, setWoError] = useState("");
  const [woSubmitting, setWoSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWoTitle("");
      setWoDescription("");
      setWoType("1");
      setWoPriority("2");
      setWoRelatedEntityId("");
      setWoSpecialNotes("");
      setWoSuccess("");
      setWoError("");
      setWoSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWoError("");
    setWoSuccess("");

    if (!woTitle || !woDescription) {
      setWoError("Lütfen başlık ve açıklama alanlarını doldurun.");
      return;
    }

    setWoSubmitting(true);
    try {
      const payload = {
        title: woTitle,
        description: woDescription,
        orderType: parseInt(woType),
        priority: parseInt(woPriority),
        relatedEntityId: woRelatedEntityId || null,
        specialNotes: woSpecialNotes
      };

      await createWorkOrder(gatewayUrl, payload, token);
      setWoSuccess("İş emri başarıyla oluşturuldu.");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setWoError(err.message || "İş emri oluşturulurken bir hata oluşlu.");
    } finally {
      setWoSubmitting(false);
    }
  };

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div 
        className="glass-panel" 
        style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Yeni İş Emri Oluştur</h3>
          <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {woError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              {woError}
            </div>
          )}
          {woSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              {woSuccess}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Başlık</label>
            <input 
              type="text" 
              className="form-input" 
              value={woTitle} 
              onChange={e => setWoTitle(e.target.value)} 
              placeholder="Örn: 34ALI534 Kaza Hasar Dosyası"
              style={{ background: '#fff', color: '#1e293b' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea 
              className="form-input" 
              value={woDescription} 
              onChange={e => setWoDescription(e.target.value)} 
              placeholder="İş emri detay açıklamasını yazın..."
              style={{ background: '#fff', color: '#1e293b', minHeight: '80px', fontFamily: 'inherit', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">İş Tipi</label>
              <select 
                className="form-input" 
                value={woType} 
                onChange={e => setWoType(e.target.value)}
                style={{ background: '#fff', color: '#1e293b' }}
              >
                <option value="1">Hasar Dosyası Açma</option>
                <option value="2">Eksper Atama</option>
                <option value="3">Poliçe Yenileme</option>
                <option value="4">Prim Tahsilat & İptal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Öncelik</label>
              <select 
                className="form-input" 
                value={woPriority} 
                onChange={e => setWoPriority(e.target.value)}
                style={{ background: '#fff', color: '#1e293b' }}
              >
                <option value="1">Düşük</option>
                <option value="2">Orta</option>
                <option value="3">Yüksek</option>
                <option value="4">Kritik</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">İlişkili Araç (Opsiyonel)</label>
            <select 
              className="form-input" 
              value={woRelatedEntityId} 
              onChange={e => setWoRelatedEntityId(e.target.value)}
              style={{ background: '#fff', color: '#1e293b' }}
            >
              <option value="">İlişkili araç seçin...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Özel Notlar</label>
            <input 
              type="text" 
              className="form-input" 
              value={woSpecialNotes} 
              onChange={e => setWoSpecialNotes(e.target.value)} 
              placeholder="Eksper ismi, acil durum detayları..."
              style={{ background: '#fff', color: '#1e293b' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={woSubmitting}>
            {woSubmitting ? "Oluşturuluyor..." : "İş Emrini Oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
};
