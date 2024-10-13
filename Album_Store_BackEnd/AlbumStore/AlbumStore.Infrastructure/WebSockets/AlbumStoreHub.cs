using Microsoft.AspNetCore.SignalR;

namespace AlbumStore.Infrastructure.WebSockets
{
    public class AlbumStoreHub : Hub
    {
        public async Task SendMessageToAll(string user, string message)
        {
            // Broadcast the message to all connected clients
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}