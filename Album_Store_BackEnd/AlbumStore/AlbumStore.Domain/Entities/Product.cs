using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Price { get; set; }
        public int NumberOfSales { get; set; }
        public int NumberOfStock { get; set; }

        public Genre Genre { get; set; }
      
        //link to version
        public virtual ICollection<ProductVersion>? ProductVersions { get; set; }
        //link to band - may be null
        public virtual Guid? BandId { get; set; }
        public virtual Band? Band { get; set; }
        //link to artists - may be null
        public virtual ICollection<Artist>? Artists { get; set; }
        //link to product order items - may be null
        public virtual ICollection<ProductOrder>? ProductOrders { get; set; }
        public Product()
        {
            Artists = [];
            ProductOrders = [];
            ProductVersions = [];
        }
        //images
        public string? BaseImageUrl { get; set; }
        public string? DetailsImageUrl { get; set; }
        public int NumberOfItemsOnHold { get; set; } = 0;


    }
}
