namespace AlbumStore.Application.Models;
public class ImageDto
{
    public string ImageBase64 { get; set; }     // Base64-encoded image data
    public string ContentType { get; set; }     // MIME type, e.g., "image/jpeg"
    public string FileName { get; set; }        // Optional file name

}
