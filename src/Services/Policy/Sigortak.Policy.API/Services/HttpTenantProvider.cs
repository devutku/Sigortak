using System.Security.Claims;
using Sigortak.Common;

namespace Sigortak.Policy.API.Services;

public class HttpTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            var claimValue = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;
            if (Guid.TryParse(claimValue, out var tenantId))
            {
                return tenantId;
            }

            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Id"].ToString();
            if (Guid.TryParse(headerValue, out var headerTenantId))
            {
                return headerTenantId;
            }

            return null;
        }
    }
}
