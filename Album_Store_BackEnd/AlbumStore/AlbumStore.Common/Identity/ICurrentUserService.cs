namespace AlbumStore.Common.Identity;

public interface ICurrentUserService
{
    Task<CurrentUser> GetCurrentUser();
}