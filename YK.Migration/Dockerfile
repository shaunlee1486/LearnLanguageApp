# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files and restore
COPY YK.LanguageLearn.slnx .
COPY YK.Domain/*.csproj ./YK.Domain/
COPY YK.Common/*.csproj ./YK.Common/
COPY YK.Application/*.csproj ./YK.Application/
COPY YK.Infrastructure/*.csproj ./YK.Infrastructure/
COPY YK.Presentation/*.csproj ./YK.Presentation/
COPY YK.Migration/*.csproj ./YK.Migration/
COPY YK.API/*.csproj ./YK.API/

RUN dotnet restore YK.LanguageLearn.slnx

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
