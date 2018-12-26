import { Point, ObservablePoint } from 'pixi.js';

export class Projectile {
    private app: PIXI.Application;
    public sprite: PIXI.Sprite;
    public movementSpeed: number;

    constructor(app: PIXI.Application, position: Point | ObservablePoint, rotation: number) {
        this.app = app;
        this.sprite = PIXI.Sprite.from('assets/player.png');
        this.sprite.anchor.set(0.5);
        this.movementSpeed = 10;
        this.sprite.position = position;
        this.sprite.rotation = rotation;
        this.app.stage.addChild(this.sprite);
        this.startMoving();
    }

    public startMoving() {
        this.app.ticker.add(this.moveForward);
    }

    public stopMoving() {
        this.app.ticker.remove(this.moveForward);
    }

    private moveForward = (delta: number) => {
        this.sprite.x = this.sprite.x + this.movementSpeed * Math.cos(this.sprite.rotation) * delta;
        this.sprite.y = this.sprite.y + this.movementSpeed * Math.sin(this.sprite.rotation) * delta;
    }
}