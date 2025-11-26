
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { Button } from '../ui/button';
import { Eraser, Trash2 } from 'lucide-react';

interface WhiteboardProps {
  ydoc: Y.Doc | null;
  provider: any | null; // WebsocketProvider type
}

const colors = [
  '#000000',
  '#EF4444',
  '#3B82F6',
  '#22C55E',
  '#F97316',
  '#8B5CF6',
];

export function Whiteboard({ ydoc, provider }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathRef = useRef<any>(null);
  
  // We keep a local copy of paths to minimize Yjs traversal during render loop
  const pathsRef = useRef<any[]>([]);

  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        requestAnimationFrame(draw); // Redraw after resize
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Yjs Sync
  useEffect(() => {
    if (!ydoc) return;
    const yPaths = ydoc.getArray('paths');

    const syncPaths = () => {
      pathsRef.current = yPaths.toArray();
      requestAnimationFrame(draw);
    };

    // Initial sync
    syncPaths();

    // Observe changes
    const observer = () => {
      syncPaths();
    };
    yPaths.observe(observer);

    return () => yPaths.unobserve(observer);
  }, [ydoc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    pathsRef.current.forEach((path) => {
      if (!path.points || path.points.length < 4) return;

      ctx.beginPath();
      ctx.lineWidth = path.strokeWidth || 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = path.color;
      
      if (path.color === '#FFFFFF') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0], path.points[1]);
      for (let i = 2; i < path.points.length; i += 2) {
        ctx.lineTo(path.points[i], path.points[i + 1]);
      }
      ctx.stroke();
    });
  }, []);

  const getPointerPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    if (!ydoc) return;
    setIsDrawing(true);
    const pos = getPointerPos(e);
    
    const id = Date.now().toString();
    const newPath = {
      id,
      points: [pos.x, pos.y],
      color: color,
      strokeWidth: 5
    };
    
    currentPathRef.current = newPath;
    
    // Optimistic update locally
    pathsRef.current.push(newPath);
    requestAnimationFrame(draw);

    // Sync start to Yjs
    const yPaths = ydoc.getArray('paths');
    yPaths.push([newPath]);
  };

  const drawMove = (e: any) => {
    if (!isDrawing || !currentPathRef.current || !ydoc) return;
    const pos = getPointerPos(e);
    
    // Update local current path
    const currentPath = currentPathRef.current;
    currentPath.points.push(pos.x, pos.y);
    
    // Redraw locally immediately (high performance)
    requestAnimationFrame(draw);

    // Sync update to Yjs (throttling could be added here for performance)
    const yPaths = ydoc.getArray('paths');
    
    // We need to find the index of our current path. 
    // Since we just pushed it, it should be the last one, but let's be safe if concurrent edits happened.
    // For simplicity in this implementation, we assume it's the last one we pushed.
    // A more robust way is to findIndex by ID.
    
    // Ideally, we update the *existing* object in the array. 
    // Y.Array doesn't support mutable objects directly unless they are Y.Maps.
    // We are using JSON objects, so we must replace the whole object or update it.
    // Replacing deeply nested objects in high frequency is expensive in Yjs.
    // Ideally 'paths' should be a Y.Array of Y.Maps.
    // For now, to keep the schema consistent with previous implementation:
    
    const index = yPaths.toArray().findIndex((p: any) => p.id === currentPath.id);
    if (index !== -1) {
       // In Yjs, replacing is delete + insert
       ydoc.transact(() => {
         yPaths.delete(index, 1);
         yPaths.insert(index, [currentPath]);
       });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    currentPathRef.current = null;
  };

  const handleClear = () => {
    if (ydoc) {
      ydoc.getArray('paths').delete(0, ydoc.getArray('paths').length);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b p-2 bg-white z-10">
        <div className="flex items-center gap-1 rounded-md border p-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-md transition-transform ${
                color === c ? 'scale-110 ring-2 ring-ring' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <Button
          variant={color === '#FFFFFF' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setColor('#FFFFFF')}
          title="Eraser"
        >
          <Eraser className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          title="Clear All"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 bg-white overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={drawMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawMove}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
