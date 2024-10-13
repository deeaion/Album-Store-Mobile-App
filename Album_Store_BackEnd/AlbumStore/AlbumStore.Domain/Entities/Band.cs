

namespace AlbumStore.Domain.Entities;
    public class Band
    { public Guid Id { get; set; }
    public string Name { get; set; }
    public Genre Genre { get; set; }
    public DateTime Founded { get; set; }
    //members
    public virtual ICollection<Artist>? Members { get; set; }
    //products
    public virtual ICollection<Product>? Products { get; set; }
    public Band()
    {
        Members = [];
        Products = [];
    }

}
    