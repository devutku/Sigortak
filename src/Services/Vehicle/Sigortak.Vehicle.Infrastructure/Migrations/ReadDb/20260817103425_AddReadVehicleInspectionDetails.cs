using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Vehicle.Infrastructure.Migrations.ReadDb
{
    /// <inheritdoc />
    public partial class AddReadVehicleInspectionDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "InspectionPassed",
                table: "vehicle_policies",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionDocumentUrl",
                table: "vehicle_policies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionPassed",
                table: "vehicle_policies");

            migrationBuilder.DropColumn(
                name: "InspectionDocumentUrl",
                table: "vehicle_policies");
        }
    }
}
