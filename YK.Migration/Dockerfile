# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files and restore
COPY *.sln .
COPY YK.Common/*.csproj ./YK.Common/
COPY YK.Migration/*.csproj ./YK.Migration/

RUN dotnet restore YK.Migration/YK.Migration.csproj

# Copy source code and build
COPY YK.Common/ ./YK.Common/
COPY YK.Migration/ ./YK.Migration/

WORKDIR /app/YK.Migration
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/runtime:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "YK.Migration.dll"]
