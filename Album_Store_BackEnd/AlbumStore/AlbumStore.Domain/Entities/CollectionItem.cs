namespace AlbumStore.Domain.Entities;
public class CollectionItem
{
    public virtual Guid Id { get; set; }
    public virtual string UserId { get; set; }
    public virtual ApplicationUser User { get; set; }
    public virtual Guid? ProductId { get; set; }
    public virtual Product Product { get; set; }
    public virtual Guid? ImageId { get; set; }
    public virtual Image Image{ get; set; }
    public string Title { get; set; }
    public string Artist { get; set; }
}

