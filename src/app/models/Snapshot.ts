import { PlayerUpdate } from './PlayerUpdate';

export interface Snapshot {
    timestamp: number,
    players: Array<PlayerUpdate>
}