using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Vehicle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInspectionAndInsuranceToVehicle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "InspectionDate",
                table: "vehicles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsuranceEndDate",
                table: "vehicles",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionDate",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "InsuranceEndDate",
                table: "vehicles");
        }
    }
}
