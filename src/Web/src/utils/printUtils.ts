export const printWorkOrder = (wo: any, vehicles: any[]): boolean => {
  const relatedVehicle = vehicles.find(v => v.id === wo.relatedEntityId);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    return false;
  }

  const orderTypeStr = (() => {
    switch (wo.orderType) {
      case 'ClaimFile':
      case 1:
        return 'Hasar Dosyası Açma';
      case 'ExpertAssignment':
      case 2:
        return 'Eksper Atama';
      case 'PolicyRenewal':
      case 3:
        return 'Poliçe Yenileme';
      case 'CollectionAndCancellation':
      case 4:
        return 'Tahsilat & İptal';
      default:
        return wo.orderType;
    }
  })();

  const priorityStr = (() => {
    switch (wo.priority) {
      case 'Low':
      case 1:
        return 'Düşük';
      case 'Medium':
      case 2:
        return 'Orta';
      case 'High':
      case 3:
        return 'Yüksek';
      case 'Critical':
      case 4:
        return 'Kritik';
      default:
        return wo.priority;
    }
  })();

  const statusStr = (() => {
    switch (wo.status) {
      case 'New':
      case 1:
        return 'Yeni';
      case 'Assigned':
      case 2:
        return 'Atandı';
      case 'InProgress':
      case 3:
        return 'İşlemde';
      case 'Completed':
      case 4:
        return 'Tamamlandı';
      case 'Cancelled':
      case 5:
        return 'İptal Edildi';
      default:
        return wo.status;
    }
  })();

  const dateStr = new Date(wo.createdAt).toLocaleDateString('tr-TR') + ' ' + new Date(wo.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const vehicleInfoHtml = relatedVehicle ? `
    <div class="field">
      <span class="field-label">Plaka:</span>
      <span class="field-value" style="font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${relatedVehicle.plate}</span>
    </div>
    <div class="field">
      <span class="field-label">Marka / Model:</span>
      <span class="field-value">${relatedVehicle.brand} ${relatedVehicle.model}</span>
    </div>
    <div class="field">
      <span class="field-label">Yıl / Kasa:</span>
      <span class="field-value">${relatedVehicle.year} / ${relatedVehicle.bodyType || 'Sedan'}</span>
    </div>
    <div class="field">
      <span class="field-label">Araç Sahibi:</span>
      <span class="field-value">${relatedVehicle.ownerName || '-'}</span>
    </div>
  ` : `
    <div class="field" style="color: #64748b; font-style: italic;">
      Bu iş emri için ilişkili bir araç bulunmamaktadır.
    </div>
  `;

  printWindow.document.write(`
    <html>
      <head>
        <title>İş Emri - ${wo.orderNumber || ''}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0077b6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #03045e;
          }
          .doc-title {
            text-align: right;
          }
          .doc-title h1 {
            margin: 0;
            font-size: 20px;
            color: #0077b6;
          }
          .doc-title p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #64748b;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            background-color: #f8fafc;
          }
          .card h3 {
            margin-top: 0;
            margin-bottom: 12px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            color: #03045e;
            font-size: 14px;
            text-transform: uppercase;
          }
          .field {
            margin-bottom: 8px;
            font-size: 13px;
          }
          .field-label {
            font-weight: bold;
            color: #475569;
          }
          .field-value {
            color: #0f172a;
          }
          .description-box {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 30px;
          }
          .description-box h3 {
            margin-top: 0;
            color: #03045e;
            font-size: 14px;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
          }
          .description-content {
            font-size: 13px;
            white-space: pre-line;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
            gap: 20px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
            border-top: 1px dashed #64748b;
            padding-top: 8px;
            font-size: 13px;
            font-weight: bold;
            color: #475569;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Sigortak</div>
          <div class="doc-title">
            <h1>OPERASYONEL İŞ EMRİ FORMU</h1>
            <p>Oluşturulma Tarihi: ${dateStr}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>İŞ EMRİ DETAYLARI</h3>
            <div class="field">
              <span class="field-label">İş Emri No:</span>
              <span class="field-value" style="font-weight: bold;">${wo.orderNumber || '-'}</span>
            </div>
            <div class="field">
              <span class="field-label">İş Tipi:</span>
              <span class="field-value">${orderTypeStr}</span>
            </div>
            <div class="field">
              <span class="field-label">Öncelik:</span>
              <span class="field-value">${priorityStr}</span>
            </div>
            <div class="field">
              <span class="field-label">Durum:</span>
              <span class="field-value">${statusStr}</span>
            </div>
            <div class="field">
              <span class="field-label">Özel Notlar:</span>
              <span class="field-value">${wo.specialNotes || '-'}</span>
            </div>
          </div>

          <div class="card">
            <h3>ARAÇ BİLGİLERİ</h3>
            ${vehicleInfoHtml}
          </div>
        </div>

        <div class="description-box">
          <h3>İŞ AÇIKLAMASI & TALİMATLAR</h3>
          <div class="description-content">
            <strong>${wo.title}</strong>
            <p>${wo.description}</p>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">Düzenleyen (Ad Soyad / İmza)</div>
          <div class="signature-box">Teslim Alan (Ad Soyad / İmza)</div>
        </div>

        <div class="footer">
          <p>Sigortak Güvenli Araç ve Muayene Takip Sistemi</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  return true;
};
