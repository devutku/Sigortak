import React, { useState, useEffect } from 'react';
import { createVehicle } from '../../services/api';

const CAR_BRANDS = [
  "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Citroen", "Cupra", "Dacia", "DS Automobiles",
  "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Maserati", 
  "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", 
  "Renault", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Togg", "Toyota", "Volvo", "Volkswagen"
];

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  gatewayUrl: string;
  initialValues?: {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    ownerTcNo?: string;
    ownerName?: string;
    ownerAddress?: string;
    usageType?: string;
    engineCapacity?: string;
    engineNumber?: string;
    chassisNumber?: string;
    registrationNumber?: string;
    bodyType?: string;
    trafficRegistrationDate?: string;
  };
}

export const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  gatewayUrl,
  initialValues
}) => {
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [year, setYear] = useState("");
  const [engineCapacity, setEngineCapacity] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerTcNo, setOwnerTcNo] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [usageType, setUsageType] = useState("");
  const [trafficRegistrationDate, setTrafficRegistrationDate] = useState("");
  const [bodyType, setBodyType] = useState("Sedan");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const brandSuggestions = brand.trim() === "" 
    ? CAR_BRANDS 
    : CAR_BRANDS.filter(b => b.toLowerCase().includes(brand.toLowerCase()) && b.toLowerCase() !== brand.toLowerCase());

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      setSubmitting(false);
      
      if (initialValues) {
        setPlate(initialValues.plate || "");
        setBrand(initialValues.brand || "");
        setModel(initialValues.model || "");
        setYear(initialValues.year || "");
        setEngineCapacity(initialValues.engineCapacity || "");
        setEngineNumber(initialValues.engineNumber || "");
        setChassisNumber(initialValues.chassisNumber || "");
        setRegistrationNumber(initialValues.registrationNumber || "");
        setOwnerName(initialValues.ownerName || "");
        setOwnerTcNo(initialValues.ownerTcNo || "");
        setOwnerAddress(initialValues.ownerAddress || "");
        setUsageType(initialValues.usageType || "");
        setTrafficRegistrationDate(initialValues.trafficRegistrationDate || "");
        setBodyType(initialValues.bodyType || "Sedan");
      } else {
        // Reset form to blank
        setPlate(""); setBrand(""); setModel(""); setYear("");
        setEngineCapacity(""); setEngineNumber(""); setChassisNumber(""); setRegistrationNumber("");
        setOwnerName(""); setOwnerTcNo(""); setOwnerAddress(""); setUsageType(""); setTrafficRegistrationDate("");
        setBodyType("Sedan");
      }
    }
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!plate || !brand || !model || !year || !ownerName) {
      setErrorMsg("Lütfen zorunlu alanları doldurun (Plaka, Marka, Model, Yıl, Araç Sahibi).");
      return;
    }

    setSubmitting(true);
    try {
      const bodyTypeIndex = ["Sedan","OffRoad","Hatchback","Pickup","Van","Sport","Micro","Convertible","Crossover","SUV","Wagon","Muscle","Roadster","Cabriolet","Limousine","Formula1"].indexOf(bodyType) + 1;
      
      const payload = {
        plate: plate.toUpperCase(),
        brand,
        model,
        year: parseInt(year),
        engineCapacity,
        engineNumber,
        chassisNumber,
        registrationNumber,
        ownerId: "00000000-0000-0000-0000-000000000000",
        ownerName,
        ownerTcNo,
        ownerAddress,
        usageType,
        trafficRegistrationDate: trafficRegistrationDate || null,
        bodyType: bodyTypeIndex
      };

      await createVehicle(gatewayUrl, payload, token);
      setSuccessMsg("Araç başarıyla eklendi! Liste güncelleniyor...");
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 94, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div 
        style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ background: 'var(--color-deep-twilight)', color: '#fff', padding: '20px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-car-side" style={{ fontSize: '20px' }}></i>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Yeni Araç Ekle</h3>
          </div>
          <button 
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: 12, borderRadius: 8, fontSize: '0.9rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-check"></i> {successMsg}
            </div>
          )}

          {/* Araç Sahibi Bilgileri */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-user" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Araç Sahibi *
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={ownerName} 
                onChange={e => setOwnerName(e.target.value)} 
                placeholder="Örn: Ahmet Yılmaz"
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-id-card" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                T.C. Kimlik / Vergi No
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={ownerTcNo} 
                onChange={e => setOwnerTcNo(e.target.value)} 
                placeholder="11 haneli T.C. No"
                maxLength={11}
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fa-solid fa-location-dot" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
              Adres
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={ownerAddress} 
              onChange={e => setOwnerAddress(e.target.value)} 
              placeholder="Müşteri adresi"
              style={{ background: '#fff', color: '#1e293b' }}
            />
          </div>

          {/* Plaka */}
          <div className="form-group">
            <label className="form-label">
              <i className="fa-solid fa-id-badge" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
              Plaka *
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={plate} 
              onChange={e => setPlate(e.target.value)} 
              placeholder="Örn: 34 ABC 123"
              style={{ background: '#fff', color: '#1e293b', textTransform: 'uppercase' }}
              required 
            />
          </div>

          {/* Marka + Model Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">
                <i className="fa-solid fa-industry" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Marka *
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={brand} 
                onChange={e => {
                  setBrand(e.target.value);
                  setShowBrandSuggestions(true);
                }} 
                onFocus={() => setShowBrandSuggestions(true)}
                onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                placeholder="Örn: Toyota"
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
              {showBrandSuggestions && brandSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '2px solid var(--color-bright-teal)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '4px'
                }}>
                  {brandSuggestions.map((b, idx) => (
                    <div 
                      key={idx}
                      onMouseDown={() => {
                        setBrand(b);
                        setShowBrandSuggestions(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        color: 'var(--color-deep-twilight)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-light-cyan)';
                        e.currentTarget.style.color = 'var(--color-bright-teal)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-deep-twilight)';
                      }}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-car" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Model *
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={model} 
                onChange={e => setModel(e.target.value)} 
                placeholder="Örn: Corolla"
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
            </div>
          </div>

          {/* Yıl + Motor Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-calendar" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Yıl *
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={year} 
                onChange={e => setYear(e.target.value)} 
                placeholder="Örn: 2023"
                min="1950" max="2030"
                style={{ background: '#fff', color: '#1e293b' }}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-gauge-high" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Motor Hacmi (Litre)
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={engineCapacity} 
                onChange={e => setEngineCapacity(e.target.value)} 
                placeholder="Örn: 1.6"
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-gears" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Motor Numarası
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={engineNumber} 
                onChange={e => setEngineNumber(e.target.value)} 
                placeholder="Motor no"
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
          </div>

          {/* Kasa Tipi + Kullanım Tarzı + Tescil Tarihi Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-truck-pickup" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Kasa Tipi
              </label>
              <select 
                className="form-input" 
                value={bodyType} 
                onChange={e => setBodyType(e.target.value)}
                style={{ background: '#fff', color: '#1e293b' }}
              >
                {["Sedan","OffRoad","Hatchback","Pickup","Van","Sport","Micro","Convertible","Crossover","SUV","Wagon","Muscle","Roadster","Cabriolet","Limousine"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-briefcase" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Kullanım Tarzı
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={usageType} 
                onChange={e => setUsageType(e.target.value)} 
                placeholder="Örn: Otomobil Hususi"
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Tescil Tarihi
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={trafficRegistrationDate} 
                onChange={e => setTrafficRegistrationDate(e.target.value)} 
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
          </div>

          {/* Şasi No + Ruhsat No Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-barcode" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Şasi Numarası
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={chassisNumber} 
                onChange={e => setChassisNumber(e.target.value)} 
                placeholder="17 haneli şasi no"
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-file-lines" style={{ marginRight: '6px', color: 'var(--color-bright-teal)' }}></i>
                Ruhsat Numarası
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={registrationNumber} 
                onChange={e => setRegistrationNumber(e.target.value)} 
                placeholder="Ruhsat seri no"
                style={{ background: '#fff', color: '#1e293b' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px', fontSize: '15px' }} 
            disabled={submitting}
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Kaydediliyor...</>
            ) : (
              <><i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i>Aracı Kaydet</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
