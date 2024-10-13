
namespace AlbumStore.Domain.Entities;
public class ProductVersion
{
    public Guid Id { get; set; }
    public string Version { get; set; }
    public string Description { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string? ImageUrl { get; set; }
    public double Price { get; set; }
    public virtual Guid ProductId { get; set; }
    public virtual Product Product { get; set; }

}
