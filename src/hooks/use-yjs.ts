
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export const useYjs = (roomId: string, user: { uid: string; name: string; color: string }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Connect to peers via WebRTC
    // We append a common prefix to the room ID to namespace our app
    // 'signaling' option uses public signaling servers by default
    const webrtcProvider = new WebrtcProvider(`collab-canvas-${roomId}`, doc, {
       signaling: ['wss://signaling.yjs.dev']
    });

    setYdoc(doc);
    setProvider(webrtcProvider);
    setAwareness(webrtcProvider.awareness);

    // Set local user state for presence
    webrtcProvider.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      id: user.uid
    });

    return () => {
      webrtcProvider.destroy();
      doc.destroy();
    };
  }, [roomId, user.uid, user.name, user.color]);

  return { ydoc, provider, awareness };
};
