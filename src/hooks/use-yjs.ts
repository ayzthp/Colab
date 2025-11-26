
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { useRoom } from '@liveblocks/react';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';

export const useYjs = (roomId: string, user: { uid: string; name: string; color: string }) => {
  const room = useRoom();
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const doc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, doc);

    setYdoc(doc);
    setProvider(yProvider);
    setAwareness(yProvider.awareness);
    setStatus('connected');

    // Sync user details to Awareness
    yProvider.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      id: user.uid
    });
    
    return () => {
      yProvider.destroy();
      doc.destroy();
    };
  }, [room, user.uid, user.name, user.color]);

  return { ydoc, provider, awareness, status };
};
