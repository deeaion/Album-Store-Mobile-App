using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Domain.Entities
{
    public class Address
    {
        public Guid Id { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string City { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }
        public string? Apartment { get; set; }
        public string? Floor { get; set; }
        public string? Entrance { get; set; }
        public double ? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
