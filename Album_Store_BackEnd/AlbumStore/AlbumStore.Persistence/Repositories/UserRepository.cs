using AlbumStore.Domain.Repositories;

namespace AlbumStore.Persistence.Repositories
{
    public class UserRepository(AlbumStoreDbContext dbContext) : IUserRepository
    {
        protected AlbumStoreDbContext context = dbContext;
        public bool DoesUserExist(string id)
        {
            return context.Users.Any(u => u.Id == id);
        }

    }
}
