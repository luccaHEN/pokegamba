import Peer, { type DataConnection } from 'peerjs';
import type { PeerMessage } from '../types/battle';

export type PeerServiceEvents = {
  onOpen: (peerId: string) => void;
  onConnected: (remotePeerId: string) => void;
  onData: (data: PeerMessage) => void;
  onDisconnected: () => void;
  onError: (err: Error) => void;
};

export class PeerBattleService {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private events: PeerServiceEvents;
  private sendQueue: PeerMessage[] = [];
  public isHost: boolean = false;
  public myId: string = '';
  public remoteId: string = '';

  constructor(events: PeerServiceEvents) {
    this.events = events;
  }

  // Create room as Host
  public createRoom(roomId: string) {
    this.isHost = true;
    this.destroy();

    const fullRoomId = `pkms-${roomId.toLowerCase().trim()}`;
    this.peer = new Peer(fullRoomId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
    });

    this.peer.on('open', (id) => {
      this.myId = id;
      this.events.onOpen(id);
    });

    this.peer.on('connection', (connection) => {
      // If host already has an active, open connection with an opponent (different peer), reject
      if (this.conn && this.conn.open && this.conn.peer !== connection.peer) {
        const reject = () => {
          try {
            connection.send({ type: 'ROOM_FULL' });
          } catch (e) {
            // ignore
          }
          setTimeout(() => {
            try { connection.close(); } catch (e) {}
          }, 350);
        };

        if (connection.open) {
          reject();
        } else {
          connection.on('open', reject);
        }
        return;
      }

      this.conn = connection;
      this.remoteId = connection.peer;
      this.setupConnection();
    });

    this.peer.on('error', (err) => {
      this.events.onError(err);
    });

    this.peer.on('disconnected', () => {
      // Reconnect if signaling server blips
      this.peer?.reconnect();
    });
  }

  // Join room as Guest
  public joinRoom(roomId: string) {
    this.isHost = false;
    this.destroy();

    this.peer = new Peer({
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
    });

    this.peer.on('open', (id) => {
      this.myId = id;
      this.events.onOpen(id);

      const targetRoomId = `pkms-${roomId.toLowerCase().trim()}`;
      const connection = this.peer!.connect(targetRoomId, {
        reliable: true
      });

      this.conn = connection;
      this.remoteId = targetRoomId;
      this.setupConnection();
    });

    this.peer.on('error', (err) => {
      this.events.onError(err);
    });
  }

  private setupConnection() {
    if (!this.conn) return;

    const onOpen = () => {
      this.flushQueue();
      this.events.onConnected(this.remoteId);
    };

    if (this.conn.open) {
      onOpen();
    } else {
      this.conn.on('open', onOpen);
    }

    this.conn.on('data', (data) => {
      this.events.onData(data as PeerMessage);
    });

    this.conn.on('close', () => {
      this.conn = null;
      this.events.onDisconnected();
    });

    this.conn.on('error', (err) => {
      this.events.onError(err as Error);
    });
  }

  private flushQueue() {
    if (this.conn && this.conn.open) {
      while (this.sendQueue.length > 0) {
        const msg = this.sendQueue.shift();
        if (msg) {
          try {
            this.conn.send(msg);
          } catch (e) {
            console.error('Failed to flush message:', e);
          }
        }
      }
    }
  }

  public send(msg: PeerMessage) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch {
        this.sendQueue.push(msg);
      }
    } else {
      this.sendQueue.push(msg);
    }
  }

  public destroy() {
    this.sendQueue = [];
    if (this.conn) {
      try {
        this.conn.close();
      } catch {
        // ignore
      }
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
  }
}
