FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY Sigortak.sln ./
COPY src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj src/BuildingBlocks/Sigortak.Common/
COPY src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj src/BuildingBlocks/Sigortak.EventBus/
COPY src/Services/Ocr/Sigortak.Ocr.Worker/Sigortak.Ocr.Worker.csproj src/Services/Ocr/Sigortak.Ocr.Worker/

RUN dotnet restore src/Services/Ocr/Sigortak.Ocr.Worker/Sigortak.Ocr.Worker.csproj

COPY . .
RUN dotnet publish src/Services/Ocr/Sigortak.Ocr.Worker/Sigortak.Ocr.Worker.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Sigortak.Ocr.Worker.dll"]
