using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YK.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase8_CustomTestSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomTestQuestionLimit",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CustomTestTimerSeconds",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomTestQuestionLimit",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomTestTimerSeconds",
                table: "Users");
        }
    }
}
