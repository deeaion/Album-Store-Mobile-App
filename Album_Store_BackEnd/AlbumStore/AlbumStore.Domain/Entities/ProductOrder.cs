

namespace AlbumStore.Domain.Entities
{
    public class ProductOrder
    {
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        //product
        public virtual Guid ProductId { get; set; }
        public virtual Product Product { get; set; }

        //orders
        public virtual Order Order { get; set; }
        public virtual Guid OrderId { get; set; }
    }
}
