using AlbumStore.Domain.Entities;

namespace AlbumStore.Application.Filtering
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Price { get; set; }
        public Genre Genre { get; set; }
        public List<ProductVersionDto>? ProductVersions { get; set; }

        public int NumberOfSales { get; set; }
        public int NumberOfStock { get; set; }
        public Guid? BandId { get; set; }
        public string? BaseImageUrl { get; set; }
        public string? DetailsImageUrl { get; set; }
        public string? BandName { get; set; }
        public List<Guid>? ArtistIds { get; set; }
        public List<ArtistDto>? Artists { get; set; }


    }
}
