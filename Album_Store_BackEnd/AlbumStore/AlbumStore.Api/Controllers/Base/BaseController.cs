using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AlbumStore.Api.Controllers.Base;

public abstract class BaseController : ControllerBase
{
    private IMediator? _mediator; // Make _mediator nullable

    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>() ?? throw new InvalidOperationException("IMediator service not found");
}
