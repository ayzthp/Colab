
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useYjs = (roomId: string, user: { uid: string; name: string; color: string }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Connect to the public y-websocket demo server
    // WARNING: This is a public server. Data is not private and may be wiped.
    // For production, deploy your own y-websocket server.
    const wsProvider = new WebsocketProvider(
      'wss://demos.yjs.dev', 
      `collab-canvas-${roomId}`, 
      doc
    );

    setYdoc(doc);
    setProvider(wsProvider);
    setAwareness(wsProvider.awareness);

    // Set local user state for presence
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

  return { ydoc, provider, awareness };
};
