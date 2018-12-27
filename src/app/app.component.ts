import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Ship } from './entities/ship';
import { Logger } from './util/logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer')
  private pixiContainer: ElementRef;
  private app: PIXI.Application;

  private playerShip: Ship;
  private ships: Array<Ship>;

  private snapshotBuffer: any[];

  constructor() {
    this.ships = new Array<Ship>();
    this.snapshotBuffer = [];
  }

  public ngOnInit(): void {
    // Create a new PIXI Application
    this.app = new PIXI.Application({
      autoResize: true,
      resolution: devicePixelRatio,
      backgroundColor: 0x1099bb
    });
    this.pixiContainer.nativeElement.appendChild(this.app.view);

    // Resize the canvas
    this.resizeHandler();
    window.addEventListener('resize', this.resizeHandler);

    // Load texture resources
    PIXI.Loader.shared
      .add([
        "assets/player.png",
        "assets/enemyPlayer.png"
      ])
      .on("progress", (loader: PIXI.Loader, resource: PIXI.LoaderResource) => {
        Logger.loading("LoadingTextures", loader.progress, resource.name);
      })
      .load(this.setup);
  }

  /**
   * Resizes the canvas to fit the parent element
   */
  private resizeHandler = (): void => {
    const parent = <Element>this.app.view.parentNode;
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    this.app.stage.position.x = this.app.renderer.width / 2;
    this.app.stage.position.y = this.app.renderer.height / 2;
    this.app.stage.scale.x = 1.0;
    this.app.stage.scale.y = 1.0;
    this.app.stage.pivot.x = 0;
    this.app.stage.pivot.y = 0;
  }

  private setup = (): void => {
    let socket = new WebSocket("ws://localhost:8080");

    // Receive messages from server
    socket.onmessage = (event: MessageEvent) => {
      let message = JSON.parse(event.data);
      switch (message.type) {
        case "snapshot":
          if (this.snapshotBuffer.length === 2) {
            this.snapshotBuffer[0] = this.snapshotBuffer[1];
            this.snapshotBuffer[1] = message.data;
          } else {
            this.snapshotBuffer.push(message.data);
          }
          t = 0;
          break;
        case "connect":
          this.spawnEnemyPlayer(message.data);
          break;
        case "disconnect":
          this.removePlayer(message.data);
          break;
        case "server_info":
          this.spawnPlayer(message.data.playerId);
          message.data.players.forEach(player => {
            this.spawnEnemyPlayer(player.id);
          });
          break;
      }
    }

    // Send input to server
    let pointerLocation: PIXI.Point;
    this.app.renderer.plugins.interaction.on('pointermove', (event) => {
      pointerLocation = event.data.getLocalPosition(this.app.stage);
    });
    setInterval(() => {
      socket.send(JSON.stringify(pointerLocation));
    }, 33)

    // Render snapshots
    let t = 0;
    PIXI.Ticker.shared.add(() => {
      t += PIXI.Ticker.shared.elapsedMS;
      let lag = 1000 / 20;
      if (this.snapshotBuffer.length === 2) {
        lag = this.snapshotBuffer[1].timestamp - this.snapshotBuffer[0].timestamp;
        this.snapshotBuffer[1].players.forEach(player => {
          let oldPlayer = this.snapshotBuffer[0].players.find(x => x.id == player.id);
          let ship: Ship;
          if (player.id == this.playerShip.id) {
            ship = this.playerShip;
          } else {
            ship = this.ships.find(ship => ship.id == player.id);
          }

          if (!ship || !oldPlayer) return;
          ship.x = this.lerp(oldPlayer.x, player.x, t / lag);
          ship.y = this.lerp(oldPlayer.y, player.y, t / lag);
          ship.rotation = player.rotation;
        });
      }
    });
  }

  private removePlayer(id: number) {
    this.app.stage.removeChild(this.ships.find(ship => ship.id == id));
    this.ships = this.ships.filter(ship => ship.id !== id);
    Logger.log("RemovedPlayer", "Player with ID #" + id + "disconnected");
  }

  private spawnPlayer(id: number) {
    this.playerShip = new Ship(PIXI.Loader.shared.resources["assets/player.png"].texture);
    this.playerShip.id = id;
    this.app.stage.addChild(this.playerShip);
    Logger.log("SpawnedPlayer", "Spawned player with ID #" + id);
  }

  private spawnEnemyPlayer(id: number) {
    let ship = new Ship(PIXI.Loader.shared.resources["assets/enemyPlayer.png"].texture);
    ship.id = id;
    this.ships.push(ship);
    this.app.stage.addChild(ship);
    Logger.log("SpawnedEnemyPlayer", "Spawned enemy player with ID #" + id);
  }

  private lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1;
  }

  public ngOnDestroy(): void {

  }

}
