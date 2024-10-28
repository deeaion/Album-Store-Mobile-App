using Microsoft.AspNetCore.Http.Connections.Features;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AlbumStore.Infrastructure.WebSockets
{
    public class AlbumStoreHub : Hub
    {
        // Dictionary to keep track of user connections
        private static readonly Dictionary<string, List<string>> UserConnections = new();

        // Example of extracting the user ID from a header in your hub
        public override Task OnConnectedAsync()
        {
            try
            {
                Console.WriteLine("--------------------------------------------------------------");
                var userId = Context.Features.Get<IHttpContextFeature>()?.HttpContext?.Request.Query["userId"].ToString();
                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine($"Connection failed: Missing userId for ConnectionId: {Context.ConnectionId}");
                    Context.Abort();
                    return Task.CompletedTask;
                }

                var connectionId = Context.ConnectionId;
                Console.WriteLine($"[{DateTime.UtcNow}] User Connected: {userId}, ConnectionId: {connectionId}");

                lock (UserConnections)
                {
                    if (!UserConnections.ContainsKey(userId))
                    {
                        UserConnections[userId] = new List<string>();
                    }
                    UserConnections[userId].Add(connectionId);
                }
                Console.WriteLine("--------------------------------------------------------------");

                return base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error on connect: {ex.Message}");
                throw;
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"[{DateTime.UtcNow}] User Disconnected: ConnectionId: {connectionId}");

            lock (UserConnections)
            {
                foreach (var userId in UserConnections.Keys)
                {
                    if (UserConnections[userId].Contains(connectionId))
                    {
                        UserConnections[userId].Remove(connectionId);
                        if (UserConnections[userId].Count == 0)
                        {
                            UserConnections.Remove(userId);
                        }
                        break;
                    }
                }
            }

            return base.OnDisconnectedAsync(exception);
        }


        // Helper to get all connection IDs for a user
        public static List<string> GetConnectionsForUser(string userId)
        {
            lock (UserConnections)
            {
                Console.WriteLine($"Checking connections for userId: {userId}");

                if (UserConnections.ContainsKey(userId))
                {
                    var connections = UserConnections[userId];
                    Console.WriteLine($"Connections found for {userId}: {string.Join(", ", connections)}");
                    return connections;
                }
                else
                {
                    Console.WriteLine($"No connections found for userId: {userId}");
                    return new List<string>();
                }
            }
        }


        // Helper to send a notification to multiple users
        public async Task SendNotificationToUsers(List<string> userIds, string message)
        {
            foreach (var userId in userIds)
            {
                var connections = GetConnectionsForUser(userId);
                foreach (var connectionId in connections)
                {
                    await Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
                }
            }
        }
    }
}
