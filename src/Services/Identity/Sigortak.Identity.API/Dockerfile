FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Tüm projeleri derlemek için solution seviyesinde kopyalama yapıyoruz
COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj src/BuildingBlocks/Sigortak.CQRS/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/Identity/Sigortak.Identity.Domain/Sigortak.Identity.Domain.csproj src/Services/Identity/Sigortak.Identity.Domain/
COPY src/Services/Identity/Sigortak.Identity.Application/Sigortak.Identity.Application.csproj src/Services/Identity/Sigortak.Identity.Application/
COPY src/Services/Identity/Sigortak.Identity.Infrastructure/Sigortak.Identity.Infrastructure.csproj src/Services/Identity/Sigortak.Identity.Infrastructure/
COPY src/Services/Identity/Sigortak.Identity.API/Sigortak.Identity.API.csproj src/Services/Identity/Sigortak.Identity.API/

RUN dotnet restore src/Services/Identity/Sigortak.Identity.API/Sigortak.Identity.API.csproj

COPY . .
RUN dotnet publish src/Services/Identity/Sigortak.Identity.API/Sigortak.Identity.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.Identity.API.dll"]
