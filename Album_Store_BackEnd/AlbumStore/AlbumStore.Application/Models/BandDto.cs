using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Domain.Entities;

namespace AlbumStore.Application.Models
{
    public class BandDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Genre { get; set; }
        public Boolean IsFavorited { get; set; }
    }
}
