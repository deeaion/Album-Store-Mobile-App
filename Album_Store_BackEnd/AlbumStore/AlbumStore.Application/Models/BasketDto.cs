namespace AlbumStore.Application.Models;
public class BasketDto
{
    public string BasketId { get; set; }
    public List<ProductBasketDto> Items { get; set; } = new List<ProductBasketDto>();
}
