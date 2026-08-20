using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Vehicle.Infrastructure.Migrations.ReadDb
{
    /// <inheritdoc />
    public partial class AddEngineNumberToReadDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EngineNumber",
                table: "vehicle_policies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EngineNumber",
                table: "vehicle_policies");
        }
    }
}
