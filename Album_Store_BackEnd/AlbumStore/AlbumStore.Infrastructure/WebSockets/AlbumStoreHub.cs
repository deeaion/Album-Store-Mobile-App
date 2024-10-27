using Microsoft.AspNetCore.SignalR;

namespace AlbumStore.Infrastructure.WebSockets
{
    public class AlbumStoreHub : Hub
    {
        // Dictionary to keep track of user connections
        private static readonly Dictionary<string, List<string>> UserConnections = new();

        public override Task OnConnectedAsync()
        {
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                lock (UserConnections)
                {
                    if (!UserConnections.ContainsKey(userId))
                    {
                        UserConnections[userId] = new List<string>();
                    }

                    UserConnections[userId].Add(Context.ConnectionId);
                }
            }

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                lock (UserConnections)
                {
                    UserConnections[userId]?.Remove(Context.ConnectionId);
                    if (!UserConnections[userId].Any())
                    {
                        UserConnections.Remove(userId);
                    }
                }
            }

            return base.OnDisconnectedAsync(exception);
        }

        // Helper to get all connection IDs for a user
        public static List<string> GetConnectionsForUser(string userId)
        {
            return UserConnections.ContainsKey(userId) ? UserConnections[userId] : new List<string>();
        }
    }
}
