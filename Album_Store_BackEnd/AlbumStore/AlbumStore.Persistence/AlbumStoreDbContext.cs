using AlbumStore.Domain.Entities;
using AlbumStore.Persistence.Seeders;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
 using Microsoft.AspNetCore.Identity;
namespace AlbumStore.Persistence;

public class AlbumStoreDbContext(DbContextOptions options) : IdentityDbContext<ApplicationUser, Role, string, IdentityUserClaim<string>, UserRole, IdentityUserLogin<string>, IdentityRoleClaim<string>, IdentityUserToken<string>>(options)
{


    public DbSet<Product> Products { get; set; }
    public DbSet<ProductOrder> ProductOrders { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Band> Bands { get; set; }
    public DbSet<ProductVersion> ProductVersions { get; set; }
    public DbSet<ApplicationLog> ApplicationLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        ConfigureProduct(modelBuilder);
        ConfigureAddress(modelBuilder);
        ConfigureUser(modelBuilder);
        ConfigureArtist(modelBuilder);
        ConfigureBand(modelBuilder);
        ConfigureOrder(modelBuilder);
        ConfigureProductOrder(modelBuilder);
        ConfigureProductVersion(modelBuilder);
        ConfigureRole(modelBuilder);
        modelBuilder.SeedForRoles();
    }

    private static void ConfigureProduct(ModelBuilder builder)
    {
        // Add configuration code for the Product entity here
        builder.Entity<Product>().Property(p => p.Id).ValueGeneratedNever();
        builder.Entity<Product>().HasMany(p => p.ProductVersions).WithOne(pv => pv.Product).HasForeignKey(pv => pv.ProductId);
        builder.Entity<Product>().HasMany(p => p.Artists).WithMany(a => a.Products);
        builder.Entity<Product>().HasMany(p => p.ProductOrders).WithOne(po => po.Product).HasForeignKey(po => po.ProductId);
        builder.Entity<Product>().HasOne(p => p.Band).WithMany(b => b.Products).HasForeignKey(p => p.BandId);
    }

    private static void ConfigureAddress(ModelBuilder builder)
    {
        // Add configuration code for the Address entity here
        builder.Entity<Address>().Property(a => a.Id).ValueGeneratedNever();
    }

    private static void ConfigureUser(ModelBuilder builder)
    {
        // Add configuration code for the ApplicationUser entity here
        builder.Entity<ApplicationUser>().Property(u => u.Id).ValueGeneratedNever();
        builder.Entity<ApplicationUser>().HasMany(u => u.UserRoles).WithOne(ur => ur.User).HasForeignKey(ur => ur.UserId);
        builder.Entity<ApplicationUser>().HasMany(u => u.Orders).WithOne(o => o.User).HasForeignKey(o => o.UserId);
        builder.Entity<ApplicationUser>().HasOne(u => u.Address);
    }

    private static void ConfigureArtist(ModelBuilder builder)
    {
        // Add configuration code for the Artist entity here
        builder.Entity<Artist>().Property(a => a.Id).ValueGeneratedNever();
        builder.Entity<Artist>().HasMany(a => a.Products).WithMany(p => p.Artists);
        builder.Entity<Artist>().HasMany(a => a.Bands).WithMany(b => b.Members);
    }

    private static void ConfigureBand(ModelBuilder builder)
    {
        // Add configuration code for the Band entity here
        builder.Entity<Band>().Property(b => b.Id).ValueGeneratedNever();
        builder.Entity<Band>().HasMany(b => b.Members).WithMany(a => a.Bands);
        builder.Entity<Band>().HasMany(b => b.Products).WithOne(p => p.Band).HasForeignKey(p => p.BandId);
    }

    private static void ConfigureOrder(ModelBuilder builder)
    {
        // Add configuration code for the Order entity here
        builder.Entity<Order>().Property(o => o.Id).ValueGeneratedNever();
        builder.Entity<Order>().HasMany(o => o.ProductOrders).WithOne(po => po.Order).HasForeignKey(po => po.OrderId);
        builder.Entity<Order>().HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId);
        builder.Entity<Order>()
            .HasOne(o => o.Address)
            .WithMany()                          
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureProductOrder(ModelBuilder builder)
    {
        builder.Entity<ProductOrder>().HasKey(po => new { po.ProductId, po.OrderId });
        builder.Entity<ProductOrder>().HasOne(po => po.Product).WithMany(p => p.ProductOrders).HasForeignKey(po => po.ProductId);
        builder.Entity<ProductOrder>().HasOne(po => po.Order).WithMany(o => o.ProductOrders).HasForeignKey(po => po.OrderId);
    }

    private static void ConfigureProductVersion(ModelBuilder builder)
    {
        builder.Entity<ProductVersion>().Property(pv => pv.Id).ValueGeneratedNever();
        builder.Entity<ProductVersion>().HasOne(pv => pv.Product).WithMany(p => p.ProductVersions).HasForeignKey(pv => pv.ProductId);
    }

    private static void ConfigureRole(ModelBuilder builder)
    {
        builder.Entity<Role>().Property(r => r.Id).ValueGeneratedNever();
        builder.Entity<Role>().HasMany(r => r.UserRoles).WithOne(ur => ur.Role).HasForeignKey(ur => ur.RoleId);
    }
}
