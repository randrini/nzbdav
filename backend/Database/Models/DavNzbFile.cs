namespace NzbWebDAV.Database.Models;

public class DavNzbFile
{
    public Guid Id { get; set; } // foreign key to DavItem.Id
    public string[] SegmentIds { get; set; } = [];

    // navigation helpers
    public DavItem? DavItem { get; set; }
}