import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Logger } from './util/Logger';
import { GameManager } from './managers/GameManager';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer')
  private pixiContainer: ElementRef;
  private app: PIXI.Application;

  private gameManager: GameManager;

  constructor() {}

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
  }

  private setup = (): void => {
    this.gameManager = new GameManager(this.app.stage);
    this.connectWebsocket();
    this.gameManager.startTicking();
  }

  private connectWebsocket() {
    let socket = new WebSocket("ws://localhost:8080");

    // Receive messages from server
    socket.onmessage = (event: MessageEvent) => {
      let message = JSON.parse(event.data);
      switch (message.type) {
        case "snapshot":
          this.gameManager.update(message.data);
          break;
        case "connect":
          this.gameManager.playerManager.spawnPlayer(message.data);
          break;
        case "disconnect":
          this.gameManager.playerManager.removePlayer(message.data);
          break;
        case "server_info":
          this.gameManager.consumeServerInfo(message.data);
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
    }, 33);
  }

  public ngOnDestroy(): void {

  }

}
