using System.Text;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Yarp.ReverseProxy.Transforms;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] [GATEWAY] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Sigortak API Gateway başlatılıyor...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // YARP Reverse Proxy
    builder.Services.AddReverseProxy()
        .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
        .AddTransforms(builderContext =>
        {
            builderContext.AddRequestTransform(transformContext =>
            {
                var user = transformContext.HttpContext.User;
                var tenantIdClaim = user.FindFirst("tenant_id")?.Value;
                if (!string.IsNullOrEmpty(tenantIdClaim))
                {
                    transformContext.ProxyRequest.Headers.Remove("X-Tenant-Id");
                    transformContext.ProxyRequest.Headers.Add("X-Tenant-Id", tenantIdClaim);
                }
                else
                {
                    var clientTenantId = transformContext.HttpContext.Request.Headers["X-Tenant-Id"].ToString();
                    if (!string.IsNullOrEmpty(clientTenantId))
                    {
                        transformContext.ProxyRequest.Headers.Remove("X-Tenant-Id");
                        transformContext.ProxyRequest.Headers.Add("X-Tenant-Id", clientTenantId);
                    }
                }
                return ValueTask.CompletedTask;
            });
        });

    // JWT Authentication (gateway seviyesinde doğrulama)
    var jwtSecret = builder.Configuration["Jwt:Secret"]!;
    builder.Services.AddAuthentication("Bearer")
        .AddJwtBearer("Bearer", options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ClockSkew = TimeSpan.Zero
            };
        });

    builder.Services.AddAuthorization();

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    var app = builder.Build();

    app.UseCors("AllowAll");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapReverseProxy();

    app.MapGet("/gateway/health", () => Results.Ok(new { Status = "Healthy", Service = "Sigortak.Gateway" }));

    Log.Information("Sigortak API Gateway başlatıldı — Port: 5000");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Gateway başlatılamadı!");
}
finally
{
    await Log.CloseAndFlushAsync();
}
