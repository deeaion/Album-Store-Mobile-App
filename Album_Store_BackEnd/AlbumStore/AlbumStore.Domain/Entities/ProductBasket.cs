namespace AlbumStore.Domain.Entities;
public class ProductBasket
{
    public Guid Id { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public virtual Guid ProductId { get; set; }
    public virtual Product Product { get; set; }
    public virtual string UserBasketId { get; set; }
    public virtual UserBasket UserBasket { get; set; }
}
