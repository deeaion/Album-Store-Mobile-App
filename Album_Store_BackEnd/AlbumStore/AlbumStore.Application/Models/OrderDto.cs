namespace AlbumStore.Application.Models;
public class OrderDto
{
    public Guid Id { get; set; }
    public List<ProductOrderDto> Products { get; set; }
    public string Address { get; set; }
    public string UserEmail { get; set; }
}
