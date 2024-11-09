namespace AlbumStore.Domain.Entities;

public class UserBasket
{
    public virtual string UserId { get; set; }
    public virtual ICollection<ProductBasket>? ProductBaskets { get; set; }
    public virtual ApplicationUser User { get; set; }
    public UserBasket()
    {
        ProductBaskets = [];
    }


}
