import { SocketHandler, SocketMethod } from '../helpers/socket.helper';
import * as io from 'socket.io';
import * as os from 'os';
import * as uuid from 'uuid';

export class SocketController extends SocketHandler {

    private peers: {
        [id: string]: { socket: io.Socket; alias: string },
    } = {};

    constructor(server: io.Server) {
        super(server);
    }

    notifyAvaliableUsers() {
        for (const key in this.server.sockets.sockets) {
            let peers = this.getAvailablePeers().filter(x => x.id !== key);
            this.server.sockets.sockets[key].emit('online', peers);
        }
    }

    @SocketMethod({ event: 'join' })
    onJoin(alias: string, client: io.Socket) {
        client.connected
        this.peers[client.id] = { socket: client, alias };
        console.log(`Socket Id #${client.id} enter lobby as ${alias}`);
        this.notifyAvaliableUsers();
        client.emit('whoami', client.id);
    }

    private getAvailablePeers(): { id: string, alias: string }[] {
        let peers: { id: string, alias: string }[] = [];
        for (const id in this.peers) {
            if (this.peers[id].socket.connected) {
                peers.push({ id, alias: this.peers[id].alias });
            }
        }
        return peers;
    }

    private isAvailable(id: string): boolean {
        return this.peers[id] && this.peers[id].socket.connected && Object.keys(this.peers[id].socket.rooms).filter(x => x != id).length == 0;
    }

    @SocketMethod({ event: 'ipaddr' })
    onIpAddr(_, client: io.Socket) {
        const ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    client.emit('ipaddr', details.address);
                }
            });
        }
    }

    @SocketMethod({ event: 'bye' })
    onBye(_, client: io.Socket) {
        Object.keys(client.rooms).filter(x => x != client.id).forEach(roomId => {
            this.deleteRoom(roomId);
        });
    }

    deleteRoom(roomId: string) {
        for (const peerId in this.server.sockets.in(roomId).sockets) {
            if (this.peers[peerId])
                this.peers[peerId].socket.leave(roomId);
        }
    }

    @SocketMethod({ event: 'leave' })
    onLeave(_, client: io.Socket) {
        this.notifyAvaliableUsers();
    }

    @SocketMethod({ event: 'rtcmessage' })
    onRTCMessage(message, client: io.Socket) {
        let room = '';
        for (const id in client.rooms) {
            if (id !== client.id) {
                room = id;
                break;
            }
        }
        client.broadcast.in(room).emit('rtcmessage', message);
    }

    @SocketMethod({ event: 'call' })
    onCall(id: string, client: io.Socket) {
        if (this.isAvailable(id) && this.isAvailable(client.id) && client.id !== id) {
            const room = uuid();
            const target = this.peers[id];
            client.join(room);
            client.emit('created', room);
            target.socket.emit('incoming', {
                room,
                alias: this.peers[client.id].alias,
                id: client.id
            });
        } else {
            client.emit('not-available', {})
        }
    }

    @SocketMethod({ event: 'call-canceled' })
    onCallCancel(id: string, client: io.Socket) {
        this.onBye(null, client);
        const target = this.peers[id];
        target.socket.emit('rejected')
    }

    @SocketMethod({ event: 'call-answered' })
    onCallAnswered(room: string, client: io.Socket) {
        var clientsInRoom = this.server.sockets.adapter.rooms[room];
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        if (numClients) {
            client.join(room);
            this.server.sockets.in(room).emit('ready');
        } else {
            client.emit('not-available', {});
        }
    }

    @SocketMethod({ event: 'call-rejected' })
    onCallRejected(room: string, client: io.Socket) {
        const clientsInRoom = this.server.sockets.adapter.rooms[room];
        for (const c in clientsInRoom.sockets) {
            this.peers[c].socket.emit('rejected', {});
        }
    }


}