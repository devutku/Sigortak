FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj src/BuildingBlocks/Sigortak.CQRS/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/Policy/Sigortak.Policy.Domain/Sigortak.Policy.Domain.csproj src/Services/Policy/Sigortak.Policy.Domain/
COPY src/Services/Policy/Sigortak.Policy.Application/Sigortak.Policy.Application.csproj src/Services/Policy/Sigortak.Policy.Application/
COPY src/Services/Policy/Sigortak.Policy.Infrastructure/Sigortak.Policy.Infrastructure.csproj src/Services/Policy/Sigortak.Policy.Infrastructure/
COPY src/Services/Policy/Sigortak.Policy.API/Sigortak.Policy.API.csproj src/Services/Policy/Sigortak.Policy.API/

RUN dotnet restore src/Services/Policy/Sigortak.Policy.API/Sigortak.Policy.API.csproj

COPY . .
RUN dotnet publish src/Services/Policy/Sigortak.Policy.API/Sigortak.Policy.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.Policy.API.dll"]
