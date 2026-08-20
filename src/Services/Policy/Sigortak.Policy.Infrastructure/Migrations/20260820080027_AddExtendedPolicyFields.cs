using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Policy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExtendedPolicyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AgencyCode",
                table: "policies",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Commission",
                table: "policies",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "policies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Discounts",
                table: "policies",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExtraCoverages",
                table: "policies",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImmLimit",
                table: "policies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "LegalProtection",
                table: "policies",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NetPremium",
                table: "policies",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "NoClaimDiscountRate",
                table: "policies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoClaimStep",
                table: "policies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PersonalAccidentCoverage",
                table: "policies",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RenewalNumber",
                table: "policies",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "TramerDocumentDate",
                table: "policies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TramerDocumentNo",
                table: "policies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "VehicleValue",
                table: "policies",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgencyCode",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "Commission",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "Discounts",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "ExtraCoverages",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "ImmLimit",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "LegalProtection",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "NetPremium",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "NoClaimDiscountRate",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "NoClaimStep",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "PersonalAccidentCoverage",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "RenewalNumber",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "TramerDocumentDate",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "TramerDocumentNo",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "VehicleValue",
                table: "policies");
        }
    }
}
