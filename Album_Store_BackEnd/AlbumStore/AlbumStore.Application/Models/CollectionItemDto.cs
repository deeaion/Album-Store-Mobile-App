namespace AlbumStore.Application.Models;
public class CollectionItemDto
{
    public Guid? Id { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? ImageId { get; set; }
    public string Title { get; set; }
    public string Artist { get; set; }
    public ImageDto Image { get; set; }
}
