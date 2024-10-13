const socket = new WebSocket("wss://localhost:7292/ws");

socket.onopen = () => {
    console.log('WebSocket connection opened');
    socket.send("Hello from client");
};

socket.onmessage = (event) => {
    console.log('Message from server: ', event.data);
};

socket.onclose = (event) => {
    console.log('WebSocket connection closed: ', event.reason);
};
