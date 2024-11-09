using AlbumStore.Application.Common;
using AlbumStore.Application.Models;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;

namespace AlbumStore.Application.Queries.OrderQueries;

public class OrderQueryHandler(IRepository<Order> _orderRepository,
    ICurrentUserService _userService) :
    IRequestHandler<GetOrderQuery, OrderDto>,
    IRequestHandler<GetOrdersQuery, CollectionResponse<OrderDto>>
{
    public Task<OrderDto> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        Order order = _orderRepository.Query()
            .FirstOrDefault(o => o.Id == request.Id);
        if (order == null)
        {
            return Task.FromResult<OrderDto>(null);
        }
        OrderDto orderDto = new OrderDto
        {
            Id = order.Id,
            Address = order.AddressShort,
            Products = order.ProductOrders.Select(po => new ProductOrderDto
            {
                ProductId = po.ProductId.ToString(),
                Quantity = po.Quantity
            }).ToList(),

        };
        return Task.FromResult(orderDto);

    }

    public async Task<CollectionResponse<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {

        string userId = (await _userService.GetCurrentUser()).UserId;

        List<OrderDto> orders = _orderRepository.Query().Where(o => o.UserId == userId)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                Address = o.AddressShort,
                Products = o.ProductOrders != null ? o.ProductOrders.Select(po => new ProductOrderDto
                {
                    ProductId = po.ProductId.ToString(),
                    Quantity = po.Quantity
                }).ToList() : new List<ProductOrderDto>()
            }).ToList();
        int numberOfItems = orders.Count;
        return await Task.FromResult(new CollectionResponse<OrderDto>(orders, numberOfItems));

    }
}