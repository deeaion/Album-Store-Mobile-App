using AlbumStore.Application.Common;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Commands.BasketCommands;

public class BasketCommandHandler(
    IRepository<UserBasket> _userBasketRepository,
    IRepository<ProductBasket> _productBasketRepository,
    ICurrentUserService _userService) :
    IRequestHandler<CreateProductBasketCommand, CommandResponse>,
    IRequestHandler<UpdateProductBasketCommand, CommandResponse>,
    IRequestHandler<DeleteProductBasketCommand, CommandResponse>
{
    public async Task<CommandResponse> Handle(CreateProductBasketCommand request, CancellationToken cancellationToken)
    {

        // Check if the UserBasket exists
        string userId = (await _userService.GetCurrentUser()).UserId;
        UserBasket? userBasket = await _userBasketRepository.Query()
            .Include(ub => ub.ProductBaskets)
            .FirstOrDefaultAsync(ub => ub.UserId == userId);

        // If the UserBasket does not exist, create a new one
        if (userBasket == null)
        {
            userBasket = new UserBasket
            {
                UserId = userId,
                ProductBaskets = new List<ProductBasket>()
            };
            _userBasketRepository.Add(userBasket);
            await _userBasketRepository.SaveChangesAsync(cancellationToken);
        }
        //caut daca exista vreun produs in cos cu acelasi product id
        ProductBasket productBasketExist = userBasket.ProductBaskets
            .FirstOrDefault(pb => pb.ProductId == request.ProductBasket.ProductId);

        if (productBasketExist != null)
        {
            productBasketExist.Quantity += request.ProductBasket.Quantity;
            productBasketExist.Price += productBasketExist.Product.Price * request.ProductBasket.Quantity;
            await _userBasketRepository.SaveChangesAsync(cancellationToken);
            return CommandResponse.Ok();
        }
        // Create a new ProductBasket
        ProductBasket productBasket = new ProductBasket
        {
            Id = Guid.NewGuid(),
            ProductId = request.ProductBasket.ProductId,
            Quantity = request.ProductBasket.Quantity,
            UserBasketId = request.ProductBasket.UserBasketId.ToString()
        };

        // Add the new ProductBasket to the UserBasket
        userBasket.ProductBaskets?.Add(productBasket);

        // Save changes to the repository
        await _userBasketRepository.SaveChangesAsync(cancellationToken);

        // Return a successful response
        return CommandResponse.Ok();
    }

    public async Task<CommandResponse> Handle(UpdateProductBasketCommand request, CancellationToken cancellationToken)
    {
        ProductBasket productBasket = await _productBasketRepository
            .Query().Include(p=>p.Product)
            .FirstOrDefaultAsync(pb => pb.Id.ToString() == request.Id);
        if (productBasket == null)
        {
            return CommandResponse.Failed(new[] { "There is no ProductBasket with that Id!" });
        }
        productBasket.Quantity = request.Quantity;
        productBasket.Price = productBasket.Product.Price * request.Quantity;   
        await _productBasketRepository.SaveChangesAsync(cancellationToken);
        return CommandResponse.Ok(productBasket);

    }

    public async Task<CommandResponse> Handle(DeleteProductBasketCommand request, CancellationToken cancellationToken)
    {
        ProductBasket productBasket = _productBasketRepository.Query()
            .FirstOrDefault(pb => pb.Id.ToString() == request.Id);
        if (productBasket == null)
        {
            return CommandResponse.Failed(new[] { "There is no ProductBasket with that Id!" });
        }
        _productBasketRepository.Remove(productBasket);
        await _productBasketRepository.SaveChangesAsync(cancellationToken);
        return CommandResponse.Ok();

    }
}
