using Microsoft.Extensions.Logging;

namespace AlbumStore.Domain.Repositories;
public interface ILogRepository<T> where T : class
{
    void LogException(LogLevel level, Exception exception);
    void Log(LogLevel level, string message = "");
}
