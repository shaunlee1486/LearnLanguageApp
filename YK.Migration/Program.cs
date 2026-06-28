using DbUp;
using System;
using System.Linq;
using System.Reflection;

namespace YK.Migration
{
    class Program
    {
        static int Main(string[] args)
        {
            var connectionString = Environment.GetEnvironmentVariable("DefaultConnection") 
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

            var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
            var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
            var dbName = Environment.GetEnvironmentVariable("DB_NAME");
            var dbUser = Environment.GetEnvironmentVariable("DB_USER");
            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

            if (string.IsNullOrEmpty(connectionString) && !string.IsNullOrEmpty(dbHost))
            {
                connectionString = $"Host={dbHost};Port={dbPort ?? "5432"};Database={dbName ?? "yk_learning_db"};Username={dbUser ?? "postgres"};Password={dbPassword ?? "postgres"};Include Error Detail=true";
            }

            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = "Host=localhost;Port=5432;Database=yk_languagelearn;Username=yk01;Password=P@ssw0rd;Include Error Detail=true";
            }

            Console.WriteLine("Starting migrations...");
            
            var hostPart = connectionString.Split(';').FirstOrDefault(x => x.StartsWith("Host", StringComparison.OrdinalIgnoreCase)) ?? "N/A";
            Console.WriteLine($"Connection: {hostPart}");

            // Ensure database exists
            EnsureDatabase.For.PostgresqlDatabase(connectionString);

            // 1. Run Schema Scripts (from Scripts/ folder)
            Console.WriteLine("Running Schema Scripts...");
            var schemaUpgradeResult = DeployChanges.To
                .PostgresqlDatabase(connectionString)
                .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly(), name => name.Contains(".Scripts."))
                .LogToConsole()
                .Build()
                .PerformUpgrade();

            if (!schemaUpgradeResult.Successful)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Schema upgrade failed:");
                Console.WriteLine(schemaUpgradeResult.Error);
                Console.ResetColor();
                return -1;
            }

            // 2. Run Seed Data Scripts (from SeedData/ folder)
            Console.WriteLine("Running Seed Data Scripts...");
            var seedUpgradeResult = DeployChanges.To
                .PostgresqlDatabase(connectionString)
                .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly(), name => name.Contains(".SeedData."))
                .LogToConsole()
                .Build()
                .PerformUpgrade();

            if (!seedUpgradeResult.Successful)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Seed data upgrade failed:");
                Console.WriteLine(seedUpgradeResult.Error);
                Console.ResetColor();
                return -1;
            }

            // 3. Run Sample Data Scripts (from SampleData/ folder) conditionally
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            if (environment.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("Running Sample Data Scripts (Development mode)...");
                var sampleUpgradeResult = DeployChanges.To
                    .PostgresqlDatabase(connectionString)
                    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly(), name => name.Contains(".SampleData."))
                    .LogToConsole()
                    .Build()
                    .PerformUpgrade();

                if (!sampleUpgradeResult.Successful)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Sample data upgrade failed:");
                    Console.WriteLine(sampleUpgradeResult.Error);
                    Console.ResetColor();
                    return -1;
                }
            }
            else
            {
                Console.WriteLine("Skipping Sample Data Scripts (Non-Development mode).");
            }

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Migrations completed successfully!");
            Console.ResetColor();
            return 0;
        }
    }
}
