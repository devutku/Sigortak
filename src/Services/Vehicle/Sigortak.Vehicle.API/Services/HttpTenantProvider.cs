using System.Security.Claims;
using Sigortak.Common;

namespace Sigortak.Vehicle.API.Services;

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

            var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader.Substring(7);
                var parts = token.Split('.');
                if (parts.Length > 1)
                {
                    try
                    {
                        var payload = parts[1];
                        payload = payload.Replace('-', '+').Replace('_', '/');
                        switch (payload.Length % 4)
                        {
                            case 2: payload += "=="; break;
                            case 3: payload += "="; break;
                        }
                        var jsonBytes = Convert.FromBase64String(payload);
                        var json = System.Text.Encoding.UTF8.GetString(jsonBytes);
                        using (var doc = System.Text.Json.JsonDocument.Parse(json))
                        {
                            if (doc.RootElement.TryGetProperty("tenant_id", out var tenantIdProp))
                            {
                                var tenantIdStr = tenantIdProp.GetString();
                                if (Guid.TryParse(tenantIdStr, out var parsedTenantId))
                                {
                                    return parsedTenantId;
                                }
                            }
                        }
                    }
                    catch
                    {
                        // ignore
                    }
                }
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
