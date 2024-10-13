using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Common.Helpful
{
    public static class SortAndPaginateUtils
    {
        public static IQueryable<T> OrderByField<T>(this IQueryable<T> source, string sortBy, string sortDirection)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
            {
                return source;
            }

            var type = typeof(T);
            var property = type.GetProperty(sortBy);
            if (property == null)
            {
                return source;
            }

            var parameter = System.Linq.Expressions.Expression.Parameter(type, "p");
            var propertyAccess = System.Linq.Expressions.Expression.MakeMemberAccess(parameter, property);
            var orderByExp = System.Linq.Expressions.Expression.Lambda(propertyAccess, parameter);

            var typeArguments = new Type[] { type, property.PropertyType };
            var methodName = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase) ? "OrderByDescending" : "OrderBy";
            var resultExp = System.Linq.Expressions.Expression.Call(typeof(Queryable), methodName, typeArguments, source.Expression, System.Linq.Expressions.Expression.Quote(orderByExp));

            return source.Provider.CreateQuery<T>(resultExp);
        }
        public static IQueryable<T> SortAndPaginate<T>(this IQueryable<T> source, string sortBy, string sortDirection, int? skip, int? take)
        {
            source = source.OrderByField(sortBy, sortDirection);
            return source.Paginate(skip, take);
        }

        public static IQueryable<T> Paginate<T>(this IQueryable<T> source, int? skip, int? take)
        {
            skip ??= 0;
            take ??= 20;

            return source.Skip(skip.Value).Take(take.Value);
        }
    }
}
