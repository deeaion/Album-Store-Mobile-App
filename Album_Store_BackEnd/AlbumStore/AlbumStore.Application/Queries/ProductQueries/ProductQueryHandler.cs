using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.QueryProjections;
using AlbumStore.Application.QueryProjections.Mappers;
using AlbumStore.Common.Helpful;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.ProductQueries
{
    public class ProductQueryHandler(IRepository<Product> productRepository) :
        IRequestHandler<GetFilteredProductsQueries, CollectionResponse<ProductOverview>>,
        IRequestHandler<GetProductQuery, ProductDto>
    {
        public async Task<CollectionResponse<ProductOverview>> Handle(GetFilteredProductsQueries request, CancellationToken cancellationToken)
        {
            IQueryable<Product> query = productRepository.Query();
            query = query.ApplyFilter(request);
            int totalNumberOfItems= await query.CountAsync(cancellationToken);
            //to overview
            IQueryable<ProductOverview> productOverviews = query.ToProductOverview();
            //add sort and pagination
            productOverviews = productOverviews.SortAndPaginate(request.SortBy, request.SortOrder, request.Skip, request.Take);
            List<ProductOverview> productOverviewsList = await productOverviews.ToListAsync(cancellationToken);
     
            return new CollectionResponse<ProductOverview>(productOverviewsList, totalNumberOfItems);
        }

        public async Task<ProductDto> Handle(GetProductQuery request, CancellationToken cancellationToken)
        {
            ProductDto? productDto =await productRepository.Query(p=>p.Id == request.Id)
                .Select(p => new ProductDto
                {
                  Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Genre = p.Genre.ToString(),
                    BandId = p.BandId,
                    BandName = p.Band.Name,
                    Artists = p.Artists.Select(a => new ArtistDto
                    {
                        Id = a.Id,
                        Name = a.Name
                    }).ToList(),
                    BaseImageUrl = p.BaseImageUrl,
                    ProductVersions = p.ProductVersions.Select(pv => new ProductVersionDto
                    {
                        Id = pv.Id,
                        Version = pv.Version,
                        Description = pv.Description,
                        ImageUrl = pv.ImageUrl,
                        Price = pv.Price,
                        ProductId = pv.ProductId
                    }).ToList()

                }).FirstOrDefaultAsync(cancellationToken);
            return productDto;
        }
    }
}
