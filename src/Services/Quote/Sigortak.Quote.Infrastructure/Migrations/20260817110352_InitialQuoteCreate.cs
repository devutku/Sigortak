using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Quote.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialQuoteCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "quotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uuid", nullable: false),
                    VehiclePlate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    VehicleInfo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    InsuranceCompany = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AgentName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PolicyType = table.Column<int>(type: "integer", nullable: false),
                    Premium = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ValidityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ImmLimit = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReplacementCarDuration = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExemptStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    GlassCovered = table.Column<bool>(type: "boolean", nullable: false),
                    AsstServices = table.Column<string>(type: "text", nullable: false),
                    PdfDocumentUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_quotes", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "quotes");
        }
    }
}
