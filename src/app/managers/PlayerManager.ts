import { Player } from '../entities/Player';
import { PlayerUpdate } from '../models/PlayerUpdate';

export class PlayerManager {
    private stage: PIXI.Container;

    public possessedPlayer: Player;
    public players: Map<number, Player>;

    constructor(stage: PIXI.Container) {
        this.stage = stage;
        this.players = new Map<number, Player>();
    }

    public spawnPlayer(update: PlayerUpdate) {
        let player = new Player(
            new PIXI.Sprite(PIXI.Loader.shared.resources["assets/enemyPlayer.png"].texture),
            new PIXI.Text("PLAYER" + update.id)
        );
        player.update(update);
        this.players.set(update.id, player);
        this.stage.addChild(player);
    }

    public spawnPossessedPlayer(update: PlayerUpdate) {
        let player = new Player(
            new PIXI.Sprite(PIXI.Loader.shared.resources["assets/player.png"].texture),
            new PIXI.Text("PLAYER" + update.id)
        );
        player.update(update);
        this.stage.addChild(player);
        this.possessedPlayer = player;
        this.players.set(update.id, player);
    }

    public removePlayer(update: PlayerUpdate) {
        let player = this.players.get(update.id);
        if (!player) return;

        this.stage.removeChild(player);
        this.players.delete(update.id);
    }

    public updatePlayers(updates: Array<PlayerUpdate>) {
        updates.forEach(update => {
            this.players.get(update.id).update(update);
        });
    }

    public interpolatePlayers(t: number) {
        this.players.forEach(player => {
            player.interpolate(t);
        });
    }
}