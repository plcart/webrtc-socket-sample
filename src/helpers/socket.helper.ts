import * as io from 'socket.io';

export interface ISocketMethod {
    event: string,
    method?: string
};

export class SocketHandler {
    static events: ISocketMethod[] = [];

    constructor(public server: io.Server) {
        setInterval(() => {
            for (const key in this.server.sockets.sockets) {
                this.server.sockets.sockets[key].emit('ping');
            }
        }, 10000);
    }

    public register(client: io.Socket) {
        SocketHandler.events.forEach(handler => {
            client.on(handler.event, (data) => {
                if (handler.method)
                    this[handler.method](data, client);
            });
        });
    }

    Emit(id: string, event: string, payload): boolean {
        let connection = this.server.sockets.sockets[id];
        return connection && connection.connected && connection.emit(event, payload);
    }

}

export function SocketMethod(params: ISocketMethod) {
    return (target: SocketHandler, propertyKey: string, descriptor: PropertyDescriptor) => {
        SocketHandler.events.push({ ...params, method: propertyKey });
    }
}