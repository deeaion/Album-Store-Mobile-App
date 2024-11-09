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
    public DbSet<ProductBasket> ProductBaskets { get; set; }
    public DbSet<UserBasket> UserBaskets { get; set; }
    public DbSet<CollectionItem> CollectionItems { get; set; }
    public DbSet<Image> Images { get; set; }

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
        ConfigureUserBasket(modelBuilder);
        ConfigureProductBasket(modelBuilder);
        ConfigureCollectionItem(modelBuilder);
        ConfigureImages(modelBuilder);
        modelBuilder.SeedForRoles();
    }

    private void ConfigureImages(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Image>().Property(i => i.Id).ValueGeneratedNever();
    }

    private void ConfigureCollectionItem(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CollectionItem>().Property(ci => ci.Id).ValueGeneratedNever();
        modelBuilder.Entity<CollectionItem>().HasOne(ci => ci.Product).WithMany().HasForeignKey(ci => ci.ProductId);
        modelBuilder.Entity<CollectionItem>().HasOne(ci => ci.User).WithMany(u => u.CollectionItems).HasForeignKey(ci => ci.UserId);
        modelBuilder.Entity<CollectionItem>().HasOne(ci => ci.Image).WithMany().HasForeignKey(ci => ci.ImageId);
    }

    private void ConfigureProductBasket(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProductBasket>().HasKey(pb => new { pb.ProductId, pb.UserBasketId });
        modelBuilder.Entity<ProductBasket>().HasOne(pb => pb.Product).WithMany().HasForeignKey(pb => pb.ProductId);
        modelBuilder.Entity<ProductBasket>().HasOne(pb => pb.UserBasket).WithMany(ub => ub.ProductBaskets).HasForeignKey(pb => pb.UserBasketId);

    }


    private void ConfigureUserBasket(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserBasket>()
            .HasKey(ub => ub.UserId); // Set UserId as the primary key

        modelBuilder.Entity<UserBasket>()
            .HasOne(ub => ub.User)
            .WithOne(u => u.UserBasket)
            .HasForeignKey<UserBasket>(ub => ub.UserId) // Set UserId as the foreign key
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserBasket>()
            .HasMany(ub => ub.ProductBaskets)
            .WithOne(pb => pb.UserBasket)
            .HasForeignKey(pb => pb.UserBasketId);
    }


    private static void ConfigureAddress(ModelBuilder builder)
    {
        // Add configuration code for the Address entity here
        builder.Entity<Address>().Property(a => a.Id).ValueGeneratedNever();
    }

    private static void ConfigureProduct(ModelBuilder builder)
    {
        builder.Entity<Product>().Property(p => p.Id).ValueGeneratedNever();
        builder.Entity<Product>().HasMany(p => p.ProductVersions).WithOne(pv => pv.Product).HasForeignKey(pv => pv.ProductId);
        builder.Entity<Product>().HasMany(p => p.Artists).WithMany(a => a.Products);
        builder.Entity<Product>().HasMany(p => p.ProductOrders).WithOne(po => po.Product).HasForeignKey(po => po.ProductId);
        builder.Entity<Product>().HasOne(p => p.Band).WithMany(b => b.Products).HasForeignKey(p => p.BandId);

        // Define join table for favorite products
        builder.Entity<Product>()
            .HasMany(p => p.UsersWhoLikeThisProduct)
            .WithMany(u => u.FavoriteProducts)
            .UsingEntity<Dictionary<string, object>>(
                "UserFavoriteProduct",  // Custom join table name
j => j.HasOne<ApplicationUser>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade).HasConstraintName("FK_UserFavoriteProduct_UserId"),
                j => j.HasOne<Product>().WithMany().HasForeignKey("ProductId").HasConstraintName("FK_UserFavoriteProduct_ProductId"));

    }

    private static void ConfigureUser(ModelBuilder builder)
    {
        builder.Entity<ApplicationUser>().Property(u => u.Id).ValueGeneratedNever();
        builder.Entity<ApplicationUser>().HasMany(u => u.UserRoles).WithOne(ur => ur.User).HasForeignKey(ur => ur.UserId);
        builder.Entity<ApplicationUser>().HasMany(u => u.Orders).WithOne(o => o.User).HasForeignKey(o => o.UserId);
        builder.Entity<ApplicationUser>().HasOne(u => u.Address);

        // Define the join table for UserFavoriteProduct (only defined here to avoid redundancy)
        builder.Entity<ApplicationUser>()
            .HasMany(u => u.FavoriteProducts)
            .WithMany(p => p.UsersWhoLikeThisProduct)
            .UsingEntity<Dictionary<string, object>>(
                "UserFavoriteProduct",
                j => j.HasOne<Product>().WithMany().HasForeignKey("ProductId").HasConstraintName("FK_UserFavoriteProduct_ProductId"),
                j => j.HasOne<ApplicationUser>().WithMany().HasForeignKey("UserId").HasConstraintName("FK_UserFavoriteProduct_UserId"));

        // Define the join table for UserFavoriteBand (only defined here to avoid redundancy)
        builder.Entity<ApplicationUser>()
            .HasMany(u => u.FavoriteBands)
            .WithMany(b => b.UsersWhoLikeThisBand)
            .UsingEntity<Dictionary<string, object>>(
                "UserFavoriteBand",
                j => j.HasOne<Band>().WithMany().HasForeignKey("BandId").HasConstraintName("FK_UserFavoriteBand_BandId"),
                j => j.HasOne<ApplicationUser>().WithMany().HasForeignKey("UserId").HasConstraintName("FK_UserFavoriteBand_UserId"));
        // configure user basket
        builder.Entity<ApplicationUser>().HasOne(u => u.UserBasket).WithOne(ub => ub.User).HasForeignKey<UserBasket>(ub => ub.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ApplicationUser>().HasMany(u => u.CollectionItems).WithOne(ci => ci.User).HasForeignKey(ci => ci.UserId);
    }


    private static void ConfigureBand(ModelBuilder builder)
    {
        builder.Entity<Band>().Property(b => b.Id).ValueGeneratedNever();
        builder.Entity<Band>().HasMany(b => b.Members).WithMany(a => a.Bands);
        builder.Entity<Band>().HasMany(b => b.Products).WithOne(p => p.Band).HasForeignKey(p => p.BandId);

        // Define join table for favorite bands
        builder.Entity<Band>()
            .HasMany(b => b.UsersWhoLikeThisBand)
            .WithMany(u => u.FavoriteBands)
            .UsingEntity<Dictionary<string, object>>(
                "UserFavoriteBand",  // Custom join table name
                j => j.HasOne<ApplicationUser>().WithMany().HasForeignKey("UserId").HasConstraintName("FK_UserFavoriteBand_UserId"),
                j => j.HasOne<Band>().WithMany().HasForeignKey("BandId").HasConstraintName("FK_UserFavoriteBand_BandId"));
    }


    private static void ConfigureArtist(ModelBuilder builder)
    {
        // Add configuration code for the Artist entity here
        builder.Entity<Artist>().Property(a => a.Id).ValueGeneratedNever();
        builder.Entity<Artist>().HasMany(a => a.Products).WithMany(p => p.Artists);
        builder.Entity<Artist>().HasMany(a => a.Bands).WithMany(b => b.Members);
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
