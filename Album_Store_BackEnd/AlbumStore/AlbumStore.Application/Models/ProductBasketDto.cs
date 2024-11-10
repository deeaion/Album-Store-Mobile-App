namespace AlbumStore.Application.Models;
public class ProductBasketDto
{
    public Guid Id { get; set; }
    public int Quantity { get; set; }
    public Guid ProductId { get; set; }
    public Guid UserBasketId { get; set; }
    public double Price { get; set; }
    public string Title { get; set; }
    public string Band { get; set; }
    public string ImagePath { get; set; }

}
