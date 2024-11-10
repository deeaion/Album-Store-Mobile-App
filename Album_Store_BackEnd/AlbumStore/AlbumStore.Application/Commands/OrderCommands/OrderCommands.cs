using AlbumStore.Application.Common;
using AlbumStore.Application.Models;

namespace AlbumStore.Application.Commands.OrderCommands;

public class CreateOrderCommand : BaseRequest<CommandResponse>
{
    public string Address { get; set; }
}
