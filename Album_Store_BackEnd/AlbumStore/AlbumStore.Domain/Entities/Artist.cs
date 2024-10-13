

namespace AlbumStore.Domain.Entities;

public class Artist
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Genre Genre { get; set; }
    public string Description { get; set; }
    //they can be in multiple bands
    public virtual ICollection<Band>? Bands { get; set; }
    //they can have multiple products
    public virtual ICollection<Product>? Products { get; set; }
    public Artist()
    {
        Bands = [];
        Products = [];
    }


}

public enum Genre
{
    Kpop=1,
    Rock,
    Pop,
    Jazz,
    Classical,
    HipHop,
    Blues,
    Country,
    Metal,
    Folk,
    Electronic,
    Reggae,
    Latin,
    RnB,
    Soul,
    Punk,
    Funk,
    World,
    NewAge,
    Dance,
    Indie,
    Alternative,
    Other
}

