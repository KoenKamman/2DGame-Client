import { PlayerUpdate } from './PlayerUpdate';

export interface ServerInfo {
    players: Array<PlayerUpdate>,
    player: PlayerUpdate,
    snapshotRate: number
}