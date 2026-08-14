namespace Sigortak.Common.Entities;

public interface IMultiTenant
{
    Guid TenantId { get; set; }
}
