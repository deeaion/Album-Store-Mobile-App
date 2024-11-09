using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Commands.BasketCommands;

public class CreateProductBasketCommand : BaseRequest<CommandResponse>
{
    public ProductBasketDto ProductBasket { get; set; }
}
public class UpdateProductBasketCommand : BaseRequest<CommandResponse>
{
    public string Id { get; set; }
    public int Quantity { get; set; }
}

public class DeleteProductBasketCommand : BaseRequest<CommandResponse>
{
    public string Id { get; set; }
}
