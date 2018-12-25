import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Player } from './player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer')
  private pixiContainer: ElementRef;
  private app: PIXI.Application;
  private player: Player;

  constructor() { }

  ngOnInit() {
    this.app = this.setup();
    this.spawnPlayer();
  }

  private setup() {
    const app = new PIXI.Application({
      autoResize: true,
      resolution: devicePixelRatio,
      backgroundColor: 0x1099bb
    });
    this.pixiContainer.nativeElement.appendChild(app.view);

    let resize = () => {
      const parent = <Element>app.view.parentNode;
      app.renderer.resize(parent.clientWidth, parent.clientHeight);
      app.stage.position.x = app.renderer.width / 2;
      app.stage.position.y = app.renderer.height / 2;
      app.stage.scale.x = 1.0;
      app.stage.scale.y = 1.0;
      app.stage.pivot.x = 0;
      app.stage.pivot.y = 0;
    }
    window.addEventListener('resize', resize);
    resize();

    return app;
  }

  private spawnPlayer() {
    this.player = new Player(this.app);
    this.player.movementSpeed = 3;
    this.player.startMoving();
    this.player.followMouse();
    //this.cameraFollow(this.player.sprite);

    window.addEventListener("keydown", () => {
      this.player.shoot();
    });
  }

  private cameraFollow(obj: PIXI.DisplayObject): void {
    this.app.ticker.add((delta: number) => {
      this.app.stage.pivot.x = obj.position.x;
      this.app.stage.pivot.y = obj.position.y;
    });
  }

  public ngOnDestroy(): void {

  }

}
