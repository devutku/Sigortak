using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Vehicle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExtendedVehicleAndPolicyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerAddress",
                table: "vehicles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerTcNo",
                table: "vehicles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "TrafficRegistrationDate",
                table: "vehicles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsageType",
                table: "vehicles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SbmPolicyNumber",
                table: "policies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerAddress",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "OwnerTcNo",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "TrafficRegistrationDate",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "UsageType",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "SbmPolicyNumber",
                table: "policies");
        }
    }
}
