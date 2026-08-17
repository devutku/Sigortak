FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj src/BuildingBlocks/Sigortak.CQRS/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/Quote/Sigortak.Quote.Domain/Sigortak.Quote.Domain.csproj src/Services/Quote/Sigortak.Quote.Domain/
COPY src/Services/Quote/Sigortak.Quote.Application/Sigortak.Quote.Application.csproj src/Services/Quote/Sigortak.Quote.Application/
COPY src/Services/Quote/Sigortak.Quote.Infrastructure/Sigortak.Quote.Infrastructure.csproj src/Services/Quote/Sigortak.Quote.Infrastructure/
COPY src/Services/Quote/Sigortak.Quote.API/Sigortak.Quote.API.csproj src/Services/Quote/Sigortak.Quote.API/

RUN dotnet restore src/Services/Quote/Sigortak.Quote.API/Sigortak.Quote.API.csproj

COPY . .
RUN dotnet publish src/Services/Quote/Sigortak.Quote.API/Sigortak.Quote.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.Quote.API.dll"]


