using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data
{
    /// <inheritdoc />
    public partial class AddedStylingServicesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StylingServicesId",
                table: "Appointments",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Type = table.Column<string>(type: "TEXT", nullable: true),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_StylingServicesId",
                table: "Appointments",
                column: "StylingServicesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Services_StylingServicesId",
                table: "Appointments",
                column: "StylingServicesId",
                principalTable: "Services",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Services_StylingServicesId",
                table: "Appointments");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_StylingServicesId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "StylingServicesId",
                table: "Appointments");
        }
    }
}
