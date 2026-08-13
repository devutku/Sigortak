FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Bağımlılıkları kopyalıyoruz
COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj src/BuildingBlocks/Sigortak.CQRS/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/Vehicle/Sigortak.Vehicle.Domain/Sigortak.Vehicle.Domain.csproj src/Services/Vehicle/Sigortak.Vehicle.Domain/
COPY src/Services/Vehicle/Sigortak.Vehicle.Application/Sigortak.Vehicle.Application.csproj src/Services/Vehicle/Sigortak.Vehicle.Application/
COPY src/Services/Vehicle/Sigortak.Vehicle.Infrastructure/Sigortak.Vehicle.Infrastructure.csproj src/Services/Vehicle/Sigortak.Vehicle.Infrastructure/
COPY src/Services/Vehicle/Sigortak.Vehicle.API/Sigortak.Vehicle.API.csproj src/Services/Vehicle/Sigortak.Vehicle.API/

RUN dotnet restore src/Services/Vehicle/Sigortak.Vehicle.API/Sigortak.Vehicle.API.csproj

COPY . .
RUN dotnet publish src/Services/Vehicle/Sigortak.Vehicle.API/Sigortak.Vehicle.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.Vehicle.API.dll"]
