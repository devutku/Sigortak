using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sigortak.Policy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniquePolicyNumberIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_policies_PolicyNumber",
                table: "policies");

            migrationBuilder.CreateIndex(
                name: "IX_policies_PolicyNumber",
                table: "policies",
                column: "PolicyNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_policies_PolicyNumber",
                table: "policies");

            migrationBuilder.CreateIndex(
                name: "IX_policies_PolicyNumber",
                table: "policies",
                column: "PolicyNumber",
                unique: true);
        }
    }
}
