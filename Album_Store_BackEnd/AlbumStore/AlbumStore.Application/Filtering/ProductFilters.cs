using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Queries.ProductQueries;
using AlbumStore.Domain.Entities;

namespace AlbumStore.Application.Filtering
{
    public static class ProductFilters
    {
        public static IQueryable<Product> ApplyFilter(this IQueryable<Product> productsQuery, GetFilteredProductsQueries query)

        {
            if (!string.IsNullOrEmpty(query.Search))
            {
                productsQuery = productsQuery.Where(p => p.Name.Contains(query.Search));
            }
            if (!string.IsNullOrEmpty(query.ArtistName))
            {
                productsQuery = productsQuery.Where(p => p.Artists.Any(a => a.Name.Contains(query.ArtistName)));
            }
            if (!string.IsNullOrEmpty(query.Genre))
            {
                productsQuery = productsQuery.Where(p => p.Genre.ToString() == query.Genre);
            }
            if (query.ArtistId !=null )
            {
                productsQuery = productsQuery.Where(p => p.Artists.Any(a => a.Id == query.ArtistId));
            }

            return productsQuery;
        }
    }
}
