
namespace AlbumStore.Application.Models;
public class ProductDeletedDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> UsersWhoFavoritedIt { get; set; }
}
