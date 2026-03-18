namespace Inventory.Api.Data;

using Microsoft.EntityFrameworkCore;
using Inventory.Api.Entities;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Category).HasColumnName("category")
                .HasConversion(
                    v => v.ToString().ToUpper(),
                    v => Enum.Parse<ProductCategory>(v, true)
                );
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.ToTable("inventories");
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Threshold).HasColumnName("threshold");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("transactions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Type).HasColumnName("type")
                .HasConversion(
                    v => v.ToString().ToUpper(),
                    v => Enum.Parse<TransactionType>(v, true)
                );
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Status).HasColumnName("status")
                .HasConversion(
                    v => v.ToString().ToUpper(),
                    v => Enum.Parse<OrderStatus>(v, true)
                );
            entity.Property(e => e.OrderedAt).HasColumnName("ordered_at");
            entity.Property(e => e.ReceivedAt).HasColumnName("received_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });
    }
}
