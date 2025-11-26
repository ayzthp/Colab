
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export const useYjs = (roomId: string, user: { uid: string; name: string; color: string }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connected');

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Use y-webrtc with default signaling servers for maximum redundancy
    const webrtcProvider = new WebrtcProvider(
      `collab-canvas-${roomId}`, 
      doc,
      { 
        // Enable all default signaling servers
        signaling: [
          'wss://signaling.yjs.dev',
          'wss://y-webrtc-signaling-eu.herokuapp.com',
          'wss://y-webrtc-signaling-us.herokuapp.com'
        ]
      }
    );

    setYdoc(doc);
    setProvider(webrtcProvider);
    setAwareness(webrtcProvider.awareness);
    
    // y-webrtc is "connected" when it has signaling, but true connection is p2p.
    // We'll just set it to connected for UI feedback.
    setStatus('connected');

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

  return { ydoc, provider, awareness, status };
};
