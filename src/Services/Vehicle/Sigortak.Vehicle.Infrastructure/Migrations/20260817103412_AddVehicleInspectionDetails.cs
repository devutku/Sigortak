using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Vehicle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleInspectionDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InspectionDocumentUrl",
                table: "vehicles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InspectionPassed",
                table: "vehicles",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionDocumentUrl",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "InspectionPassed",
                table: "vehicles");
        }
    }
}
