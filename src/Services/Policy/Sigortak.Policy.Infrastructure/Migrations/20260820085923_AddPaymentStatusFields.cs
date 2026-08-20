using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Policy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentStatusFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "policies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDate",
                table: "policies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentNote",
                table: "policies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "PaymentDate",
                table: "policies");

            migrationBuilder.DropColumn(
                name: "PaymentNote",
                table: "policies");
        }
    }
}
