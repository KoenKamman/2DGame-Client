import { Sprite, Texture } from 'pixi.js';

export class Ship extends Sprite {
    public velocity: number;
    public id: number;

    constructor(texture: Texture) {
        // Set properties
        super(texture);
        this.velocity = 3;

        // Center anchor
        this.anchor.set(0.5, 0.5);

        // Start ticking
        //PIXI.Ticker.shared.add(deltaTime => this.eachTick(deltaTime));
    }

    private eachTick(deltaTime: number) {
        this.x += this.velocity * Math.cos(this.rotation) * deltaTime;
        this.y += this.velocity * Math.sin(this.rotation) * deltaTime;
    }
}