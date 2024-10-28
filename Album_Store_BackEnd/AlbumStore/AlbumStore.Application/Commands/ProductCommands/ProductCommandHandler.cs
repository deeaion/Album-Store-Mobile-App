using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Commands.ProductCommands
{
    internal class ProductCommandHandler(IRepository<Product> repository,
        IRepository<Artist> _artistRepository,
        IRepository<Product> _repository,
        ICurrentUserService _currentUserService,
        IRepository<ApplicationUser> _userRepository,
        IRepository<Band> _bandRepository,
        ILogRepository<ProductCommandHandler> logRepository) :
        IRequestHandler<CreateProductCommand, CommandResponse>,
        IRequestHandler<UpdateProductCommand, CommandResponse>,
        IRequestHandler<DeleteProductCommand, CommandResponse<ProductDeletedDto>>,
        IRequestHandler<AddFavoriteProductCommand, CommandResponse>,
        IRequestHandler<RemoveFavoriteProductCommand, CommandResponse>
    {
        private readonly ILogRepository<ProductCommandHandler> _logRepository = logRepository;

        public async Task<CommandResponse> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
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
            product.BandId = request.ProductDto.BandId;
            product.Genre = Enum.Parse<Genre>(request.ProductDto.Genre.ToString());
            //get the user who modified the product
            String user = (await _currentUserService.GetCurrentUser()).UserId;
            product.ModifiedBy = user;
            product.ModifiedDate = DateTime.Now;
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }

        public async Task<CommandResponse> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            List<Artist> artists = [];
            if (request.ProductDto.ArtistIds != null)
            { artists = await GetArtists(request.ProductDto.ArtistIds); }
            //get the user who created the product
            String user = (await _currentUserService.GetCurrentUser()).UserId;
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
                BandId = request.ProductDto.BandId,
                Genre = Enum.Parse<Genre>(request.ProductDto.Genre.ToString()),
                Artists = artists,
                CreatedBy = user,
                CreatedDate = DateTime.UtcNow // Use UTC
            };

            _repository.Add(product);
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }

        public async Task<CommandResponse<ProductDeletedDto>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            Product? product = await _repository.Query(p => p.Id == request.Id).Include(p=>p.UsersWhoLikeThisProduct).FirstOrDefaultAsync();
            if (product == null)
            {
                return (CommandResponse<ProductDeletedDto>)CommandResponse<ProductDeletedDto>.Failed(new[] { "There is no Product with that Id!" });
            }

            ProductDeletedDto productDeletedDto = new ProductDeletedDto()
            {
                Id = product.Id.ToString(),
                Name = product.Name,
                UsersWhoFavoritedIt = product.UsersWhoLikeThisProduct?.Select(u => u.Id).ToList() ?? new List<string>()
            };

            //fac copie
            _repository.Remove(product);
            await _repository.SaveChangesAsync(cancellationToken);

            return CommandResponse.Ok(productDeletedDto); // Updated to use CommandResponse.Ok()
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

        public async Task<CommandResponse> Handle(AddFavoriteProductCommand request,
            CancellationToken cancellationToken)
        {
            // get current user id
            String userId = (await _currentUserService.GetCurrentUser()).UserId;
            Product product = await _repository.Query(p => p.Id == request.ProductId).FirstOrDefaultAsync();
            if (product == null)
            {
                return CommandResponse.Failed(new[] { "There is no Product with that Id!" });
            }
            ApplicationUser user = await _userRepository.Query(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return CommandResponse.Failed(new[] { "There is no User with that Id!" });
            }
            if (product.UsersWhoLikeThisProduct == null)
            {
                product.UsersWhoLikeThisProduct = new List<ApplicationUser>();
            }
            product.UsersWhoLikeThisProduct.Add(user);
            //user.FavoriteProducts.Add(product);
            await _repository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }



        public async Task<CommandResponse> Handle(RemoveFavoriteProductCommand request, CancellationToken cancellationToken)
        {
            Console.WriteLine("HERE"); // Debugging message

            // Get the current user ID
            String userId = (await _currentUserService.GetCurrentUser()).UserId;

            // Fetch the product and include UsersWhoLikeThisProduct to ensure the relationship is loaded
            Product? product = await _repository
                .Query(p => p.Id == request.ProductId)
                .Include(p => p.UsersWhoLikeThisProduct) // Ensure relationship is loaded
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return CommandResponse.Failed(new string[] { "Product does not exist!" });
            }

            // Fetch the user
            ApplicationUser? user = await _userRepository.Query(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return CommandResponse.Failed(new string[] { "User does not exist!" });
            }

            // Check if user has this product as a favorite
            if (!product.UsersWhoLikeThisProduct.Contains(user))
            {
                return CommandResponse.Failed(new string[] { "User has not favorited this product!" });
            }

            // Remove the user from the product's UsersWhoLikeThisProduct collection
            // fac copie la lista de useri care au dat like la produs

            product.UsersWhoLikeThisProduct.Remove(user);

            // Save changes to update the database
            await _repository.SaveChangesAsync(cancellationToken);

            return CommandResponse.Ok();
        }

    }
}
