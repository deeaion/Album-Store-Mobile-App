using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AlbumStore.Persistence.Repositories.Base;

public class LogRepository<T> : ILogRepository<T> where T : class
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger _logger;

    public LogRepository(IServiceProvider serviceProvider, ILogger<T> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public void Log(LogLevel level, string message = "")
    {
        using (IServiceScope scope = _serviceProvider.CreateScope())
        {
            AlbumStoreDbContext dbContext = scope.ServiceProvider.GetRequiredService<AlbumStoreDbContext>();

            try
            {
                ApplicationLog logEntry = new ApplicationLog
                {
                    Id = Guid.NewGuid(),
                    MachineName = Environment.MachineName,
                    LoggedAt = DateTime.UtcNow,
                    Level = level.ToString(),
                    Message = message,
                    Logger = typeof(T).FullName,
                    CallStack = null,
                    ExceptionMessage = null,
                    ExceptionSource = null
                };

                dbContext.ApplicationLogs.Add(logEntry);
                dbContext.SaveChanges();

                _logger.Log(level, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while logging to the database.");
            }
        }
    }

    public void LogException(LogLevel level, Exception exception)
    {
        using (IServiceScope scope = _serviceProvider.CreateScope())
        {
            AlbumStoreDbContext dbContext = scope.ServiceProvider.GetRequiredService<AlbumStoreDbContext>();

            try
            {
                ApplicationLog logEntry = new ApplicationLog
                {
                    Id = Guid.NewGuid(),
                    MachineName = Environment.MachineName,
                    LoggedAt = DateTime.UtcNow,
                    Level = level.ToString(),
                    Message = exception.Message,
                    Logger = typeof(T).FullName,
                    CallStack = exception.StackTrace,
                    ExceptionMessage = exception.Message,
                    ExceptionSource = exception.Source
                };

                dbContext.ApplicationLogs.Add(logEntry);
                dbContext.SaveChanges();

                _logger.Log(level, exception, exception.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while logging an exception to the database.");
            }
        }
    }
}
