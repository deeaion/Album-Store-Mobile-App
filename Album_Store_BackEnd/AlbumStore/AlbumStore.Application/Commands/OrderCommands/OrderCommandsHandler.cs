using AlbumStore.Application.Common;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Commands.OrderCommands;
public class OrderCommandsHandler(
    IRepository<Order> _orderRepository,
    IRepository<ApplicationUser> _userRepository,
    IRepository<Product> _productRepository,
    ICurrentUserService _userService,
    IRepository<UserBasket> _basketRepository,
    IRepository<ProductBasket> _productBasketRepository) :
    IRequestHandler<CreateOrderCommand, CommandResponse>
{
    public async Task<CommandResponse> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        string userId= (await _userService.GetCurrentUser()).UserId;
        var user = await _userRepository.Query()
            .Include(u => u.UserBasket)
            .ThenInclude(ub => ub.ProductBaskets)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.UserBasket == null || !user.UserBasket.ProductBaskets.Any())
        {
              return  CommandResponse.Failed(new [] { "The user does not have any products in the basket" });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AddressShort = request.Address,
            ProductOrders = new List<ProductOrder>()
        };
        _orderRepository.Add(order);
        _orderRepository.SaveChangesAsync(cancellationToken);
        //acum adaug produsele in order
        foreach (var productBasket in user.UserBasket.ProductBaskets)
        {
            var product = await _productRepository.Query()
                .FirstOrDefaultAsync(p => p.Id == productBasket.ProductId);

            if (product == null)
            {
                return CommandResponse.Failed(new[] { "Product not found" });
            }
            var productOrder = new ProductOrder
            {
                ProductId = product.Id,
                OrderId = order.Id,
                Price = (decimal)productBasket.Price,
                Quantity = productBasket.Quantity,
            };

            order.ProductOrders.Add(productOrder);
        }

        await _orderRepository.SaveChangesAsync(cancellationToken);
        foreach (var productBasket in user.UserBasket.ProductBaskets.ToList())
        {
            user.UserBasket.ProductBaskets.Remove(productBasket);
            _productBasketRepository.Remove(productBasket);
        }

        await _basketRepository.SaveChangesAsync(cancellationToken);

        return CommandResponse.Ok();
    }
}
