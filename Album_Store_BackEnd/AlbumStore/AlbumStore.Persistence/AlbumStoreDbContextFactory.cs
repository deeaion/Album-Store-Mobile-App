using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AlbumStore.Persistence;

public class AlbumStoreDbContextFactory : IDesignTimeDbContextFactory<AlbumStoreDbContext>
{
    public AlbumStoreDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AlbumStoreDbContext>();
        //i am gonna use postgresql
        optionsBuilder.UseNpgsql("Host=localhost;Port=5433;Database=AlbumStore;Username=postgres;Password=piki");


        return new AlbumStoreDbContext(optionsBuilder.Options);
    }

}