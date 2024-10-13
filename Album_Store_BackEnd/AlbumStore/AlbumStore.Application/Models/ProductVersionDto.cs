using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.Filtering
{
    public  class ProductVersionDto
    {
        public Guid Id { get; set; }
        public string Version { get; set; }
        public string Description { get; set; }
        public string? ImageUrl { get; set; }
        public double Price { get; set; }
        public Guid ProductId { get; set; }
    }
}
