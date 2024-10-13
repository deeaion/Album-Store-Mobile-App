﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Application.Models
{
    public class ApplicationUserDto
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Token { get; set; }
        public string? Email { get; set; }
        public string[] Roles { get; set; }
    }
}
