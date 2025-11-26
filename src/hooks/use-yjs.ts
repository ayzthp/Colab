
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useYjs = (roomId: string, user: { uid: string; name: string; color: string }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Connecting to public y-websocket demo server
    // If this fails, check your network firewall
    const wsProvider = new WebsocketProvider(
      'wss://demos.yjs.dev', 
      `collab-canvas-${roomId}`, 
      doc
    );

    wsProvider.on('status', (event: any) => {
      console.log(`[Yjs] ${roomId} Status:`, event.status);
      setStatus(event.status);
    });

    setYdoc(doc);
    setProvider(wsProvider);
    setAwareness(wsProvider.awareness);

    wsProvider.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      id: user.uid
    });

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, [roomId, user.uid, user.name, user.color]);

  return { ydoc, provider, awareness, status };
};
