const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const _ = require("lodash");


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected clients
const clients = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/admin.html');  // Serve the admin page
});

// When an admin client connects
io.on('connection', (socket) => {
    console.log('A new client connected');

    // Add the new socket to the clients array
    clients.push(socket);

    // Listen for screen-stream event from the frontend
    socket.on('screen-stream', (data) => {
        console.log('Received screen-stream data from frontend', data);
        // Broadcast the stream to all connected admin clients
        // Try to check if the data is a Buffer or ArrayBuffer
        if (Buffer.isBuffer(data)) {
            console.log('Received data is a Buffer');
            // Handle Buffer data here (you can create a Blob if necessary)
        } else if (data instanceof ArrayBuffer) {
            console.log('Received data is an ArrayBuffer');
            // Handle ArrayBuffer data here (you can convert it to a Blob if necessary)
        } else {
            console.log('Received data is neither a Blob, Buffer, nor ArrayBuffer');
        }

        if (data instanceof Blob) {
            // Log the MIME type of the Blob
            console.log('MIME type of the data:', data.type);
        } else {
            console.log('Data is not a Blob, it is:', typeof data);
        }
        try {
            clients.forEach((clientSocket) => {
                throttledData(clientSocket, data)
                // clientSocket.emit('screen-stream', data);  // Send stream to all connected clients
                console.log("Data sent to admin");
            });
        } catch (err) {
            console.log('Error broadcasting stream:', err);
        }
    });

    socket.on("mouse-move", (data) => {
        throttledMouseMove(socket, data);
    });

    socket.on("mouse-click", (data) => {
        console.log("Mouse click triggered");
        let room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("mouse-click", data);
    });

    socket.on("mouse-type", (data) => {
        throttledType(socket, data)
    });


    const throttledData = _.throttle((socket, data) => {
        socket.emit('screen-stream', data);
    })

    // Handle client disconnects
    socket.on('disconnect', () => {
        console.log('A client disconnected');
        // Remove the disconnected client from the array
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    const throttledType = _.throttle((socket, data) => {
        const room = data.room;
        socket.broadcast.to(room).emit("mouse-type", JSON.stringify(data));
    })


    const throttledMouseMove = _.throttle((socket, data) => {
        console.log("Mouse Move triggered");
        const room = data.room;
        socket.broadcast.to(room).emit("mouse-move", JSON.stringify(data));
    }, 50); // Throttle with a delay of 50ms (adjust as needed)
});

// Start the server on port 5000
server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
