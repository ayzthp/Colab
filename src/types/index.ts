
import type { Timestamp } from 'firebase/firestore';

export interface Participant {
  uid: string;
  name: string;
  avatar: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  color: string;
  points: Point[];
}

export interface Room {
  id: string;
  hostId: string;
  name: string;
  createdAt: Timestamp;
  members: Record<string, Participant>;
  writingPowerId: string;
}

export interface CodeEditorData {
    roomId: string;
    code: string;
    language: string;
    input: string;
    output: string;
    writingPowerId: string;
}

    
