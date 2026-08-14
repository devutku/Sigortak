namespace Sigortak.WorkOrder.Domain.Enums;

public enum WorkOrderType
{
    ClaimFile = 1,              // Hasar Dosyası Açma
    ExpertAssignment = 2,       // Eksper Atama
    PolicyRenewal = 3,          // Poliçe Yenileme / Düzenleme
    CollectionAndCancellation = 4 // Prim Tahsilat ve İptal İşlemleri
}
