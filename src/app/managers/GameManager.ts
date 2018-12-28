import { Snapshot } from '../models/Snapshot';
import { GameState } from '../models/GameState';
import { PlayerManager } from './PlayerManager';
import { ServerInfo } from '../models/ServerInfo';

export class GameManager {
    private snapshotBuffer: Array<Snapshot>;
    private timeSinceLastSnapshot: number;
    private snapshotUpdateRate: number;

    public gameState: GameState;
    public playerManager: PlayerManager;

    constructor(stage: PIXI.Container) {
        this.snapshotBuffer = new Array<Snapshot>();
        this.timeSinceLastSnapshot = 0;
        this.gameState = GameState.SETUP;
        this.playerManager = new PlayerManager(stage);
        this.snapshotUpdateRate = 20;
    }

    public consumeServerInfo(serverInfo: ServerInfo) {
        this.snapshotUpdateRate = serverInfo.snapshotRate;
        serverInfo.players.forEach(player => {
            this.playerManager.spawnPlayer(player);
        });
        this.playerManager.spawnPlayer(serverInfo.player);
    }

    public update(snapshot: Snapshot) {
        if (this.snapshotBuffer.length >= 2) this.snapshotBuffer.shift();
        this.snapshotBuffer.push(snapshot);
        this.timeSinceLastSnapshot = 0;
        this.playerManager.updatePlayers(snapshot.players);
    }

    public startTicking() {
        this.gameState = GameState.PLAYING;

        PIXI.Ticker.shared.add(() => {
            this.timeSinceLastSnapshot += PIXI.Ticker.shared.elapsedMS;

            let lag: number;
            if (this.snapshotBuffer.length >= 2) {
                lag = this.snapshotBuffer[1].timestamp - this.snapshotBuffer[0].timestamp;
            } else {
                lag = 1000 / this.snapshotUpdateRate;
            }

            if (this.gameState !== GameState.PLAYING) return;
            this.render(this.timeSinceLastSnapshot / lag);
        });
    }

    private render(t: number) {
        this.playerManager.interpolatePlayers(t);
    }
}