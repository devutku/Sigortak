namespace Sigortak.Common;

public interface ITenantProvider
{
    Guid? TenantId { get; }
}
