using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data
{
    /// <inheritdoc />
    public partial class AddedIsUserVerifiedField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUserVerified",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUserVerified",
                table: "Users");
        }
    }
}
