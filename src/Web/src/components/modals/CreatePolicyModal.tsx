import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../../types';
import { createPolicy } from '../../services/api';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSuccess: () => void;
  token: string;
  gatewayUrl: string;
  initialVehicleId?: string;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSuccess,
  token,
  gatewayUrl,
  initialVehicleId
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [sbmPolicyNumber, setSbmPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [premium, setPremium] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError("");
      setFormSuccess("");
      setSubmitting(false);
      
      setSelectedVehicleId(initialVehicleId || "");
      setPolicyNumber("");
      setSbmPolicyNumber("");
      setStartDate("");
      setEndDate("");
      setPremium("");
      setPdfFile(null);
    }
  }, [isOpen, initialVehicleId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedVehicleId || !policyNumber || !startDate || !endDate || !premium) {
      setFormError("Lütfen tüm alanları doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("policyNumber", policyNumber);
      formData.append("sbmPolicyNumber", sbmPolicyNumber);
      formData.append("vehicleId", selectedVehicleId);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("premium", premium);
      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      await createPolicy(gatewayUrl, formData, token);
      setFormSuccess("Poliçe başarıyla tanımlandı!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Yeni Poliçe Tanımla</h3>
          <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {formError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              {formError}
            </div>
          )}
          {formSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              {formSuccess}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Araç Seçin</label>
            <select 
              className="form-input" 
              value={selectedVehicleId} 
              onChange={e => setSelectedVehicleId(e.target.value)}
              style={{ background: '#fff', color: '#1e293b' }}
              required
            >
              <option value="">Araç Seçin...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Poliçe Numarası</label>
            <input 
              type="text" 
              className="form-input" 
              value={policyNumber} 
              onChange={e => setPolicyNumber(e.target.value)} 
              placeholder="Örn: POL-987654"
              style={{ background: '#fff', color: '#1e293b' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">SBM Poliçe Numarası</label>
            <input 
              type="text" 
              className="form-input" 
              value={sbmPolicyNumber} 
              onChange={e => setSbmPolicyNumber(e.target.value)} 
              placeholder="Örn: 701161329"
              style={{ background: '#fff', color: '#1e293b' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Başlangıç Tarihi</label>
              <input 
                type="date" 
                className="form-input" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bitiş Tarihi</label>
              <input 
                type="date" 
                className="form-input" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Prim Tutarı (TL)</label>
            <input 
              type="number" 
              className="form-input" 
              value={premium} 
              onChange={e => setPremium(e.target.value)} 
              placeholder="Örn: 12500"
              style={{ background: '#fff', color: '#1e293b' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Poliçe Belgesi (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              className="form-input" 
              style={{ background: '#fff', color: '#1e293b' }}
              onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={submitting}>
            {submitting ? "Kaydediliyor..." : "Poliçeyi Kaydet ve Yayınla"}
          </button>
        </form>
      </div>
    </div>
  );
};
