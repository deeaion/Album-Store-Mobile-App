
using Microsoft.AspNetCore.Identity;

namespace AlbumStore.Domain.Entities;
public class ApplicationUser : IdentityUser
{


    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string DisplayName { get; set; }
    public bool IsDisabledByAdmin { get; set; }
    public virtual ICollection<UserRole> UserRoles { get; set; }
    public virtual ICollection<Order> Orders { get; set; }
    public virtual Guid? AddressId { get; set; }
    public virtual Address? Address { get; set; }
    public ApplicationUser()
    {
        UserRoles = [];
        Orders = [];
    }
}

