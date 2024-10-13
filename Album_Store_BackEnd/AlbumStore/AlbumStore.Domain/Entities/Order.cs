

namespace AlbumStore.Domain.Entities;
public class Order
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime FinishedAt { get; set; }
    public int TotalPrice { get; set; }
    public Status Status { get; set; }
    //link to user
    public virtual string UserId { get; set; }
    public virtual ApplicationUser User { get; set; }
    // link to product Order
    public virtual ICollection<ProductOrder>? ProductOrders { get; set; }
    //link to adress
    public virtual Guid AddressId { get; set; }
    public virtual Address Address { get; set; }
    public Order()
    {
        ProductOrders = [];
    }

}
public enum Status
{
    New,
    InProgress,
    Finished
}
