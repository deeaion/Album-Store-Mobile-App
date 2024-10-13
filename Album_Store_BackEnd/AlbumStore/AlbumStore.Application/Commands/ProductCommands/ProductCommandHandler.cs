using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Commands.ProductCommands
{
    internal class ProductCommandHandler(IRepository<Product> repository,
        IRepository<Artist> artistRepository,
        ILogRepository<ProductCommandHandler> logRepository) :
        IRequestHandler<CreateProductCommand, CommandResponse>,
        IRequestHandler<UpdateProductCommand, CommandResponse>,
        IRequestHandler<DeleteProductCommand, CommandResponse>
    {
        private readonly IRepository<Product> _repository = repository;
        private readonly IRepository<Artist> _artistRepository = artistRepository;
        private readonly ILogRepository<ProductCommandHandler> _logRepository = logRepository;

        public async  Task<CommandResponse> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            Product product = _repository.Query(p => p.Id == request.ProductDto.Id).FirstOrDefault();
            if (product == null)
            {
                return CommandResponse.Failed(new[] { "There is no Product with that Id!" });
            }
            product.Name = request.ProductDto.Name;
            product.Description = request.ProductDto.Description;
            product.Price = request.ProductDto.Price;
            product.NumberOfSales = request.ProductDto.NumberOfSales;
            product.NumberOfStock = request.ProductDto.NumberOfStock;
            product.BaseImageUrl = request.ProductDto.BaseImageUrl;
            product.DetailsImageUrl = request.ProductDto.DetailsImageUrl;
            product.BandId = request.ProductDto.BandId ;
            product.Genre = request.ProductDto.Genre;
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }

        public async Task<CommandResponse> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            List<Artist> artists = [];
            if(request.ProductDto.ArtistIds!=null)
            { artists = await GetArtists(request.ProductDto.ArtistIds);}
            Product product = new Product
            {
                Id = Guid.NewGuid(),
                Name = request.ProductDto.Name,
                Description = request.ProductDto.Description,
                Price = request.ProductDto.Price,
                NumberOfSales = request.ProductDto.NumberOfSales,
                NumberOfStock = request.ProductDto.NumberOfStock,
                BaseImageUrl = request.ProductDto.BaseImageUrl,
                DetailsImageUrl = request.ProductDto.DetailsImageUrl,
                BandId = request.ProductDto.BandId ,
                Genre = request.ProductDto.Genre,
                Artists = artists
            };
            _repository.Add(product);
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }

        public async Task<CommandResponse> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            Product product = await _repository.Query(p => p.Id == request.Id).FirstOrDefaultAsync();
            if (product == null)
            {
                return CommandResponse.Failed(new[] {"There is no Product with that Id!"});

            }
            _repository.Remove(product);
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }
        private async Task<List<Artist>> GetArtists(List<Guid> artistIds)
        {
            List<Artist> artists = new List<Artist>();
            foreach (var artistId in artistIds)
            {
                var artist = await _artistRepository.Query(a => a.Id == artistId).FirstOrDefaultAsync();
                if (artist != null)
                {
                    artists.Add(artist);
                }
            }
            return artists;
        }
    }
}
