import type { Vehicle, Quote } from '../types';

const mapBackendQuoteToFrontend = (q: any): Quote => {
  let policyType = 1;
  if (q.policyType === 'Traffic' || q.policyType === 2) {
    policyType = 2;
  }
  
  let status = 0;
  if (q.status === 'Approved' || q.status === 1) {
    status = 1;
  } else if (q.status === 'Rejected' || q.status === 2) {
    status = 2;
  }

  return {
    id: q.id,
    vehicleId: q.vehicleId,
    vehiclePlate: q.vehiclePlate,
    vehicleInfo: q.vehicleInfo,
    insuranceCompany: q.insuranceCompany,
    agentName: q.agentName,
    policyType: policyType,
    premium: q.premium,
    validityDate: q.validityDate,
    status: status,
    immLimit: q.immLimit,
    replacementCar: q.replacementCarDuration || q.replacementCar || '',
    deductible: q.exemptStatus || q.deductible || '',
    glassCoverage: q.glassCovered !== undefined ? q.glassCovered : q.glassCoverage,
    assistance: q.asstServices === 'Dahil' || q.asstServices === 'true' || q.asstServices === true || q.assistance || false,
    documentUrl: q.pdfDocumentUrl || q.documentUrl || ''
  };
};

export const login = async (gatewayUrl: string, payload: any) => {
  const res = await fetch(`${gatewayUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Giriş başarısız.");
  }
  return data;
};

export const getVehicles = async (gatewayUrl: string, token: string): Promise<Vehicle[]> => {
  const res = await fetch(`${gatewayUrl}/api/v1/vehicles`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error("Araçlar yüklenemedi");
  }
  const data = await res.json();
  return data.data || [];
};

export const getWorkOrders = async (gatewayUrl: string, token: string): Promise<any[]> => {
  const res = await fetch(`${gatewayUrl}/api/v1/workorders`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error("İş emirleri yüklenemedi");
  }
  const data = await res.json();
  return data.data || [];
};

export const getQuotes = async (gatewayUrl: string, token: string): Promise<Quote[]> => {
  const res = await fetch(`${gatewayUrl}/api/v1/quotes`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error("Teklifler yüklenemedi");
  }
  const data = await res.json();
  const rawQuotes = data.data || data;
  return Array.isArray(rawQuotes) ? rawQuotes.map(mapBackendQuoteToFrontend) : [];
};

export const approveQuote = async (gatewayUrl: string, id: string, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/quotes/${id}/approve`, {
    method: 'POST',
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Teklif onaylanamadı.");
  }
  return res;
};

export const rejectQuote = async (gatewayUrl: string, id: string, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/quotes/${id}/reject`, {
    method: 'POST',
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error("Teklif reddedilemedi.");
  }
  return res;
};

export const createVehicle = async (gatewayUrl: string, payload: any, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Araç oluşturulamadı.");
  }
  return res;
};

export const createWorkOrder = async (gatewayUrl: string, payload: any, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/workorders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "İş emri oluşturulurken bir hata oluştu.");
  }
  return data;
};

export const updateWorkOrderStatus = async (gatewayUrl: string, id: string, status: number, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/workorders/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ id, status })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "İş emri durumu güncellenemedi.");
  }
  return res;
};

export const createPolicy = async (gatewayUrl: string, formData: FormData, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/policies`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Poliçe oluşturulamadı.");
  }
  return data;
};

export const renewPolicy = async (gatewayUrl: string, formData: FormData, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/policies/renew`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Poliçe yenilenemedi.");
  }
  return data;
};

export const markPolicyPaid = async (gatewayUrl: string, policyId: string, note: string, token: string) => {
  const res = await fetch(`${gatewayUrl}/api/v1/policies/${policyId}/mark-paid`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ note })
  });
  if (!res.ok) {
    throw new Error("Ödeme işlemi başarısız.");
  }
  return res;
};
