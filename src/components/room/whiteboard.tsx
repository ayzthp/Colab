
'use client';

import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
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
  const [paths, setPaths] = useState<any[]>([]);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false); // Ref for immediate access in event handlers
  
  // To support resizing
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ydoc) return;
    const yPaths = ydoc.getArray('paths');

    // Initial sync
    setPaths(yPaths.toArray());

    // Observe changes
    const observer = () => {
      setPaths(yPaths.toArray());
    };
    yPaths.observe(observer);

    return () => yPaths.unobserve(observer);
  }, [ydoc]);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setStageDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    if (!ydoc) return;
    setIsDrawing(true);
    isDrawingRef.current = true;
    
    const pos = e.target.getStage().getPointerPosition();
    const id = Date.now().toString();
    
    const newPath = {
      id,
      points: [pos.x, pos.y],
      color: color,
      strokeWidth: 5
    };
    
    const yPaths = ydoc.getArray('paths');
    yPaths.push([newPath]);
  };

  const handleMouseMove = (e: any) => {
    // Critical: check ref, not state, for high-frequency events if closure is stale
    if (!isDrawingRef.current || !ydoc) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const yPaths = ydoc.getArray('paths');
    // Get the last path
    if (yPaths.length === 0) return;
    
    // We modify the last path in place (optimize for performance by replacing)
    // In a production app, you might want to optimize this further
    const index = yPaths.length - 1;
    const currentPath: any = yPaths.get(index);
    
    // Create new points array
    const newPoints = currentPath.points.concat([point.x, point.y]);
    
    // Update the path (delete and insert is the standard Yjs way for immutable-like updates on index)
    // Note: modifying deeply nested objects in Yjs can be done via Y.Map if path was a Y.Map
    // keeping it simple as JSON object for now.
    
    ydoc.transact(() => {
        yPaths.delete(index, 1);
        yPaths.insert(index, [{ ...currentPath, points: newPoints }]);
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    isDrawingRef.current = false;
  };

  const handleClear = () => {
    if (ydoc) {
      ydoc.getArray('paths').delete(0, ydoc.getArray('paths').length);
    }
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full flex-col">
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
      
      <div className="flex-1 bg-white overflow-hidden">
        <Stage
          width={stageDimensions.width}
          height={stageDimensions.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {paths.map((path, i) => (
              <Line
                key={i}
                points={path.points}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  path.color === '#FFFFFF' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
