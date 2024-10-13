
using AlbumStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Persistence.Seeders
{
    public static class SeedForUserRoles
    {
        public static void SeedForRoles(this ModelBuilder builder)
        {
            builder.Entity<Role>().HasData(
                new Role()
                {
                    Id = "72835638-C499-4941-9357-135FCBBA2E33",
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new Role()
                {
                    Id = "15deed41-a5ef-4c17-80a3-38a84fbc47af",
                    Name = "User",
                    NormalizedName = "USER"
                },
                new Role()
                {
                    Id = "a62aa6cc-fa7b-4235-aad9-179dd36a98f9",
                    Name = "Guest",
                    NormalizedName = "Guest"
                }
            );
        }
    }

    }

