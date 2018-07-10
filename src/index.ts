import * as express from 'express';
import * as bodyparser from 'body-parser';
import * as cors from 'cors';
import * as io from 'socket.io';
import { createServer } from 'http';
import { Controller } from './helpers/controller.helper';
import { HomeController } from './controllers/home.controller';
import { SocketController } from './controllers/socket.controller';


export const app = express();
export const server = createServer(app);
export const socket = io.listen(server, { origins: '*:*' });
var controllers: Controller[] = [new HomeController()];
export const socketHandler = new SocketController(socket);

socket.origins('*:*');

app.use(cors({ allowedHeaders: '*', origin: '*' }));
app.use(bodyparser.json({ limit: '50mb' }));

controllers.forEach((c: Controller) => {
    c.register(app);
});

socket.on('connection', (client) => {
    socketHandler.register(client);
});

server.listen(8081, () => {
    console.log('WebRTC Socket Server running - have a nice day');
});