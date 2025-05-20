import WebSocket from 'ws';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { UserTokenPayload, verifyToken } from "./utils/jwt";
import { eventEmitter } from "./crawler";

let wss: WebSocket.Server | undefined = undefined;

const activeConnections = new Map<number, WebSocket>();

export function initWebSocket(server: Server<typeof IncomingMessage, typeof ServerResponse>) {

  if (wss) {
    console.log('WebSocket server already initialized');
    return;
  }

  wss = new WebSocket.Server({ server });
  console.log('WebSocket server initialized');

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('Client attempting to connect...');

    const user = getUser(req);

    if (!user) {
      console.log('Connection rejected: No token provided.');
      ws.close(1008, 'Token required');
      return;
    }

    (ws as any).userId = user.userId;

    console.log(`Client connected with userId: ${user.userId}`);

    activeConnections.set(user.userId, ws);

    ws.on('message', (message) => {
      console.log(`Received from ${(ws as any).userId}: ${message}`);
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'crawler_job_stop') {
          console.log(`Received from ${(ws as any).userId}: ${message}`);
          eventEmitter.emit(`${data.jobId}_crawler_job_stop`, data.jobId);
        }
      } catch (error) {
        console.error(`Error parsing message: ${error}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${(ws as any).userId}:`, error);
      if ((ws as any).userId) {
        activeConnections.delete((ws as any).userId);
      }
    });

    ws.on('close', () => {
      const closedUserId = (ws as any).userId;
      if (closedUserId) {
        activeConnections.delete(closedUserId);
        console.log(`Client disconnected: userId ${closedUserId}`);
      } else {
        console.log('Client disconnected: (userId unknown)');
      }
    });

  });
}

type WsMessageType = 'crawler_job_started' |
  'crawler_job_progress' |
  'crawler_job_progress_error' |
  'crawler_job_finished' |
  'analyser_job_relevance_started' |
  'analyser_job_relevance_finished' |
  'analyser_job_analysis_started' |
  'analyser_job_analysis_finished';

interface WsMessagePayload {
  type: WsMessageType;
  jobId: number;
  data?: object | Array<object>;
}
export function sendWsMessageToUser(userId: number, message: WsMessagePayload) {
  const ws = activeConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    const messageString = JSON.stringify(message);
    ws.send(messageString);
  } else {
    if (!ws) console.log(`No active WS connection found for user ${userId}.`);
    else if (ws.readyState !== WebSocket.OPEN) console.log(`WS connection for user ${userId} is not OPEN (state: ${ws.readyState}).`);
  }
}

function getUser(req: IncomingMessage): UserTokenPayload | null {
  const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
  const token = urlParams.get('token');

  if (!token) return null;

  return verifyToken(token) as UserTokenPayload;
}