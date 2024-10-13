using System.Text.Json.Serialization;
using AlbumStore.Common.Identity;
using MediatR;

namespace AlbumStore.Application.Common;

public class BaseRequest<T> : IRequest<T>
{
    [JsonIgnore]
    public CurrentUser? User { get; set; }
}