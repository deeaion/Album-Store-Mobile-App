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
    ICurrentUserService _userService) :
    IRequestHandler<CreateOrderCommand, CommandResponse>
{
    public async Task<CommandResponse> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        //get all the product ids from the dto
        List<string> productOrders = request.Order.Products.Select(po => po.ProductId).ToList();
        // get the products from the database
        List<Product> products = await _productRepository.Query()
            .Where(p => productOrders.Contains(p.Id.ToString()))
            .ToListAsync(cancellationToken)
            ;
        // get the user who created the order
        string userId = (await _userService.GetCurrentUser()).UserId;
        ApplicationUser user = await _userRepository.Query()
            .Include(u => u.UserBasket)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        // create the order
        Order order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductOrders = products.Select(p => new ProductOrder
            {
                ProductId = p.Id,
                Quantity = request.Order.Products.First(po => po.ProductId == p.Id.ToString()).Quantity
            }).ToList(),
            TotalPrice = products.Sum(p => p.Price),
            AddressShort = request.Order.Address,
            Status = Status.InProgress
        };
        // add the order to the user
        user.Orders.Add(order);
        // save the changes
        await _orderRepository.SaveChangesAsync(cancellationToken);
        return CommandResponse.Ok();


    }
}
