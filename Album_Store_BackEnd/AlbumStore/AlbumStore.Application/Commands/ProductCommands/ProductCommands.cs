using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Common;
using AlbumStore.Application.Filtering;

namespace AlbumStore.Application.Commands.ProductCommands;

public class CreateProductCommand : BaseRequest<CommandResponse>
{
    public ProductDto ProductDto { get; set; }
}
public class UpdateProductCommand : BaseRequest<CommandResponse>
{
    public ProductDto ProductDto { get; set; }
}
public class DeleteProductCommand : BaseRequest<CommandResponse>
{
    public Guid Id { get; set; }
}

