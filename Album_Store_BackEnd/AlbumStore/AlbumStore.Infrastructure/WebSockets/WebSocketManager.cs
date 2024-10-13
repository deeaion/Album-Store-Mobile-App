using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace AlbumStore.Infrastructure.WebSockets
{
    public class WebSocketManager
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

        public void AddSocket(string id, WebSocket socket)
        {
            _sockets.TryAdd(id, socket);
        }

        public async Task RemoveSocket(string id)
        {
            if (_sockets.TryRemove(id, out var socket))
            {
                if (socket != null)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Socket closed", CancellationToken.None);
                    socket.Dispose();
                }
            }
        }

        public async Task SendMessageToAllAsync(string message)
        {
            foreach (var socket in _sockets.Values)
            {
                if (socket.State == WebSocketState.Open)
                {
                    var buffer = Encoding.UTF8.GetBytes(message);
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}