FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj src/BuildingBlocks/Sigortak.CQRS/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/WorkOrder/Sigortak.WorkOrder.Domain/Sigortak.WorkOrder.Domain.csproj src/Services/WorkOrder/Sigortak.WorkOrder.Domain/
COPY src/Services/WorkOrder/Sigortak.WorkOrder.Application/Sigortak.WorkOrder.Application.csproj src/Services/WorkOrder/Sigortak.WorkOrder.Application/
COPY src/Services/WorkOrder/Sigortak.WorkOrder.Infrastructure/Sigortak.WorkOrder.Infrastructure.csproj src/Services/WorkOrder/Sigortak.WorkOrder.Infrastructure/
COPY src/Services/WorkOrder/Sigortak.WorkOrder.API/Sigortak.WorkOrder.API.csproj src/Services/WorkOrder/Sigortak.WorkOrder.API/

RUN dotnet restore src/Services/WorkOrder/Sigortak.WorkOrder.API/Sigortak.WorkOrder.API.csproj

COPY . .
RUN dotnet publish src/Services/WorkOrder/Sigortak.WorkOrder.API/Sigortak.WorkOrder.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.WorkOrder.API.dll"]
