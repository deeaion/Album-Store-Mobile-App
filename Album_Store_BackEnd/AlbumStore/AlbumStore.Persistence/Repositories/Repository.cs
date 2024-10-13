using AlbumStore.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Persistence.Repositories
{
    public class Repository<T>(AlbumStoreDbContext context) : IRepository<T> where T : class
    {
        protected AlbumStoreDbContext DbContext = context;

        public void Add(T entity) => DbContext.Add(entity);

        public IQueryable<T> Query(Expression<Func<T, bool>> whereFilter = null)
        {
            DbSet<T> query = DbContext.Set<T>();
            return whereFilter != null ? query.Where(whereFilter) : query;
        }

        public void Remove(T entity) => DbContext.Remove(entity);
        public void RemoveRange(IEnumerable<T> entities)
        {
            DbContext.RemoveRange(entities);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => await DbContext.SaveChangesAsync(cancellationToken);
    }

}
