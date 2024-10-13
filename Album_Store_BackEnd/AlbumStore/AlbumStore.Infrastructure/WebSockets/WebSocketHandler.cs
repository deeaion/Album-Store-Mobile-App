using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace AlbumStore.Infrastructure.WebSockets
{
    public class WebSocketHandler
    {
        private readonly WebSocketManager _webSocketManager;

        public WebSocketHandler(WebSocketManager webSocketManager)
        {
            _webSocketManager = webSocketManager;
        }

        public async Task Handle(HttpContext context, WebSocket webSocket)
        {
            var socketId = Guid.NewGuid().ToString();
            _webSocketManager.AddSocket(socketId, webSocket);
            var buffer = new byte[1024 * 4];

            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            while (!result.CloseStatus.HasValue)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                await _webSocketManager.SendMessageToAllAsync($"Echo: {message}");
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            await _webSocketManager.RemoveSocket(socketId);
        }
    }
}