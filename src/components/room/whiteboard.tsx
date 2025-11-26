
'use client';

import { useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import {
  useMutation,
  useMyPresence,
  useOthers,
  useStorage,
} from '@liveblocks/react/suspense';
import type { LiveList, LiveObject } from '@liveblocks/client';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

type Point = { x: number; y: number };
type Stroke = {
  id: string;
  color: string;
  width: number;
  points: Point[];
};

const palette = ['#111111', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#8B5CF6'];

export function Whiteboard() {
  const strokes = useStorage(root => {
    const list = (root as { strokes?: Stroke[] }).strokes;
    if (!list) return [];
    return list;
  });

  const [presence, updateMyPresence] = useMyPresence();
  const cursor = (presence as { cursor?: Point } | undefined)?.cursor;
  const others = useOthers();

  const createStroke = useMutation(({ storage }, stroke: Stroke) => {
    const list = storage.get('strokes') as LiveList<Stroke>;
    list.push(stroke);
  }, []);

  const appendPoint = useMutation(({ storage }, strokeId: string, point: Point) => {
    const list = storage.get('strokes') as LiveList<Stroke>;
    for (let i = list.length - 1; i >= 0; i--) {
      const stroke = list.get(i) as Stroke;
      if (stroke.id === strokeId) {
        list.set(i, { ...stroke, points: [...stroke.points, point] });
        break;
      }
    }
  }, []);

  const clearBoard = useMutation(({ storage }) => {
    const list = storage.get('strokes') as LiveList<Stroke>;
    list.clear();
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const drawingId = useRef<string | null>(null);
  const [color, setColor] = useState(palette[0]);

  const getPointer = (e: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const point = getPointer(e);
    const id = nanoid();
    drawingId.current = id;
    createStroke({ id, color, width: 4, points: [point] });
    updateMyPresence({ cursor: point });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!drawingId.current) return;
    e.preventDefault();
    const point = getPointer(e);
    appendPoint(drawingId.current, point);
    updateMyPresence({ cursor: point });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    if (!drawingId.current) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    drawingId.current = null;
    updateMyPresence({ cursor: undefined });
  };

  const renderStroke = (stroke: Stroke) => {
    const path = stroke.points.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <polyline
        key={stroke.id}
        points={path}
        fill="none"
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderCursor = (pos?: Point, key?: string | number) => {
    if (!pos) return null;
    return (
      <circle
        key={key}
        cx={pos.x}
        cy={pos.y}
        r={6}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b p-2 bg-white z-10">
        <div className="flex items-center gap-1 rounded-md border p-1">
          {palette.map(c => (
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
        <Button variant="ghost" size="icon" onClick={clearBoard} title="Clear All">
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 bg-white overflow-hidden relative">
        <svg
          ref={svgRef}
          className="absolute inset-0 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            drawingId.current = null;
            updateMyPresence({ cursor: undefined });
          }}
        >
          {strokes.map(renderStroke)}
          {cursor && renderCursor(cursor, -1)}
          {others.map(other =>
            renderCursor((other.presence as { cursor?: Point } | undefined)?.cursor, other.connectionId),
          )}
        </svg>
      </div>
    </div>
  );
}
