namespace AlbumStore.Application.Models;

public class ProductOrderDto
{
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string ProductId { get; set; }
    public string Title { get; set; }
    public string Band { get; set; }
    public string OrderId { get; set; }
}

