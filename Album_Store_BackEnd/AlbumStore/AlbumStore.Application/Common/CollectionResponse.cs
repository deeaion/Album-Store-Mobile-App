namespace AlbumStore.Application.Common;

public class CollectionResponse<T>(IList<T> records, int totalNumberOfRecords)
{
    public IList<T> Records { get; set; } = records;

    public int TotalNumberOfRecords { get; set; } = totalNumberOfRecords;
}
