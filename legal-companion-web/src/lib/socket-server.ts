/**
 * Socket.IO Server Setup
 * WebSocket server for real-time notifications
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './api-auth';

export interface ServerToClientEvents {
  'notification:new': (notification: any) => void;
  'notification:read': (notificationId: string) => void;
  'notification:deleted': (notificationId: string) => void;
  'document:upload:progress': (progress: { documentId: string; progress: number }) => void;
  'document:processed': (document: { id: string; title: string }) => void;
  'sync:progress': (progress: { connectionId: string; progress: number; status: string }) => void;
  'sync:completed': (result: { connectionId: string; success: boolean; filesProcessed: number }) => void;
  'task:updated': (task: { id: string; status: string }) => void;
  'event:reminder': (event: { id: string; title: string; eventDate: Date }) => void;
}

export interface ClientToServerEvents {
  'notification:mark-read': (notificationId: string) => void;
  'notification:mark-all-read': () => void;
  'notification:delete': (notificationId: string) => void;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

/**
 * Initialize Socket.IO server
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  if (io) {
    console.log('[Socket.IO] Server already initialized');
    return io;
  }

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const payload = await verifyToken(token);
      if (!payload) {
        return next(new Error('Invalid authentication token'));
      }

      // Attach user info to socket
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket.IO] User connected: ${userId}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle notification mark as read
    socket.on('notification:mark-read', async (notificationId) => {
      try {
        // Emit to all user's connections
        io?.to(`user:${userId}`).emit('notification:read', notificationId);
      } catch (error) {
        console.error('[Socket.IO] Error marking notification as read:', error);
      }
    });

    // Handle notification delete
    socket.on('notification:delete', async (notificationId) => {
      try {
        // Emit to all user's connections
        io?.to(`user:${userId}`).emit('notification:deleted', notificationId);
      } catch (error) {
        console.error('[Socket.IO] Error deleting notification:', error);
      }
    });

    // Disconnection handler
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] User disconnected: ${userId}, reason: ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`[Socket.IO] Socket error for user ${userId}:`, error);
    });
  });

  console.log('[Socket.IO] Server initialized');
  return io;
}

/**
 * Get Socket.IO server instance
 */
export function getSocketServer(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

/**
 * Emit notification to specific user
 */
export function emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
  if (!io) {
    console.warn('[Socket.IO] Server not initialized, cannot emit event');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit notification to all connected users
 */
export function emitToAll(event: keyof ServerToClientEvents, data: any) {
  if (!io) {
    console.warn('[Socket.IO] Server not initialized, cannot emit event');
    return;
  }

  io.emit(event, data);
}
