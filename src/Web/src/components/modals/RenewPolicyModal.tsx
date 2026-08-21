import React, { useState, useEffect } from 'react';
import { renewPolicy } from '../../services/api';

interface RenewPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  policyNumber: string;
  onSuccess: () => void;
  token: string;
  gatewayUrl: string;
}

export const RenewPolicyModal: React.FC<RenewPolicyModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  policyNumber,
  onSuccess,
  token,
  gatewayUrl
}) => {
  const [renewPolicyNo, setRenewPolicyNo] = useState("");
  const [renewSbmPolicyNo, setRenewSbmPolicyNo] = useState("");
  const [renewPremium, setRenewPremium] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRenewPolicyNo(policyNumber ? policyNumber + "-R" : "");
      setRenewSbmPolicyNo("");
      setRenewPremium("");
      setErrorMsg("");
      setSubmitting(false);
    }
  }, [isOpen, policyNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!vehicleId || !renewPolicyNo || !renewPremium) {
      setErrorMsg("Lütfen zorunlu alanları doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("vehicleId", vehicleId);
      formData.append("policyNumber", renewPolicyNo);
      formData.append("sbmPolicyNumber", renewSbmPolicyNo);
      formData.append("premium", renewPremium);

      await renewPolicy(gatewayUrl, formData, token);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Poliçe yenilenirken bir hata oluştu.");
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
        style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-deep-twilight)' }}>Poliçe Yenile</h3>
          <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Yeni Poliçe Numarası</label>
            <input 
              type="text" 
              className="form-input" 
              value={renewPolicyNo} 
              onChange={e => setRenewPolicyNo(e.target.value)} 
              style={{ background: '#fff', color: '#1e293b' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yeni SBM Poliçe Numarası</label>
            <input 
              type="text" 
              className="form-input" 
              value={renewSbmPolicyNo} 
              onChange={e => setRenewSbmPolicyNo(e.target.value)} 
              placeholder="Örn: 701161329"
              style={{ background: '#fff', color: '#1e293b' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yeni Prim Tutarı (TL)</label>
            <input 
              type="number" 
              className="form-input" 
              value={renewPremium} 
              onChange={e => setRenewPremium(e.target.value)} 
              placeholder="Örn: 15000"
              style={{ background: '#fff', color: '#1e293b' }}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={submitting}>
            {submitting ? "Yenileniyor..." : "Poliçeyi Yenile"}
          </button>
        </form>
      </div>
    </div>
  );
};
