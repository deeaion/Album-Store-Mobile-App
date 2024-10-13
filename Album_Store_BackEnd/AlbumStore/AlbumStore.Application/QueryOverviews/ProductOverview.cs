using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.QueryProjections
{
    public class ProductOverview
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string BandName { get; set; }
        public string ArtistsName { get; set; }
        public string Image { get; set; }

    }
}
