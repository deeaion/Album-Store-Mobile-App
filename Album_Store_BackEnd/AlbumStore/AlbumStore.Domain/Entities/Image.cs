namespace AlbumStore.Domain.Entities
{
    public class Image
    {
        public Guid Id { get; set; }
        public byte[] Data { get; set; }
        public string ContentType { get; set; }
        public string FileName { get; set; }
        public Image() { }

    }
}
