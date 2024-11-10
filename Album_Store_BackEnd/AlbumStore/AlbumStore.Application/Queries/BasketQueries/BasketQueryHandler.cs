using AlbumStore.Application.Models;
using AlbumStore.Common.Identity;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.BasketQueries;
public class BasketQueryHandler(IRepository<UserBasket> _userBasketRespository,
    IRepository<ProductBasket> _productBasketRepository,
    ICurrentUserService _userService) :
    IRequestHandler<GetBasketQuery, BasketDto>,
    IRequestHandler<GetProductBasketQuery, ProductBasketDto>

{
    public async Task<BasketDto> Handle(GetBasketQuery request, CancellationToken cancellationToken)
    {
        string userId = (await _userService.GetCurrentUser()).UserId;
        UserBasket userBasket = _userBasketRespository.Query()
            .Include(ub => ub.ProductBaskets)
            .FirstOrDefault(ub => ub.UserId == userId);
        if (userBasket == null)
        {
            return new BasketDto();
        }
        BasketDto basketDto = new BasketDto
        {
            BasketId = userBasket.UserId,
            Items = userBasket.ProductBaskets.Select(pb => new ProductBasketDto
            {
                Id = pb.Id,
                ProductId = pb.ProductId,
                Quantity = pb.Quantity,
                Price = pb.Price
            }).ToList()
        };
        return basketDto;
    }

    public async Task<ProductBasketDto> Handle(GetProductBasketQuery request, CancellationToken cancellationToken)
    {
        ProductBasketDto productBasketDto = await _productBasketRepository.Query()
            .Where(p => p.Id == Guid.Parse(request.Id))
            .Select(pb => new ProductBasketDto
            {
                Id = pb.Id,
                ProductId = pb.ProductId,
                Quantity = pb.Quantity
            }).FirstOrDefaultAsync(cancellationToken);
        return productBasketDto;
    }
}
