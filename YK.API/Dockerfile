# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and restore dependencies
COPY *.sln .
COPY YK.Domain/*.csproj ./YK.Domain/
COPY YK.Common/*.csproj ./YK.Common/
COPY YK.Application/*.csproj ./YK.Application/
COPY YK.Infrastructure/*.csproj ./YK.Infrastructure/
COPY YK.Presentation/*.csproj ./YK.Presentation/
COPY YK.API/*.csproj ./YK.API/

RUN dotnet restore

# Copy source code and build
COPY . .
WORKDIR /app/YK.API
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "YK.API.dll"]
