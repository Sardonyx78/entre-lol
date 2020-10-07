import { EventEmitter } from "events";
import { get } from 'https';
import WebSocket from 'ws';
import { cert } from './cert';
import { WSEvents } from './WSEvents';

interface LeagueWebSocketOptions {
     auth: string,
     ip?: string,
     port: number
}

export function resolveEventType(event: "Create" | "Update" | "Delete"): EVENT_TYPE {
     if (event === "Create") return EVENT_TYPE.CREATE
     else if (event === "Update") return EVENT_TYPE.UPDATE
     else if (event === "Delete") return EVENT_TYPE.DELETE
     else return EVENT_TYPE.UPDATE
}

export class LeagueWebSocket extends EventEmitter {
     private controller: WebSocket
     public authHeader: string
     public ip: string;
     public port: number;
     public readonly subscriptions: Set<keyof WSEvents>;

     constructor(options: LeagueWebSocketOptions) {
          super()

          this.ip = options.ip || "127.0.0.1"
          this.port = options.port
          this.authHeader = `Basic ${options.auth}`

          this.controller = new WebSocket(`wss://${this.ip}:${this.port}`, {
               headers: {
                    Authorization: this.authHeader
               },
               ca: cert,
               agent: false
          })

          this.subscriptions = new Set()

          this.controller.on("message", this.onMessage.bind(this))
     }

     private onMessage(incdata: string) {
          const data: [number, keyof WSEvents, { data: any[], eventType: "Create" | "Update" | "Delete", uri: string }] = JSON.parse(incdata)

          if (data[0] === 8) this.emit(data[1], resolveEventType(data[2].eventType), data[2].uri, ...data[2].data)
     }

     public subscribe(event: keyof WSEvents): boolean {
          if (this.subscriptions.has(event)) return false
          this.controller.send(JSON.stringify([5, event]))
          this.subscriptions.add(event)
          return true
     }

     public unsubscribe(event: keyof WSEvents): boolean {
          if (!this.subscriptions.has(event)) return false
          this.controller.send(JSON.stringify([6, event]))
          this.subscriptions.delete(event)
          return true
     }

     public async getEvents(): Promise<string[]> {
          const res = JSON.parse(await new Promise(resolve => {
               get({
                    headers: {
                         Authorization: this.authHeader
                    },
                    hostname: this.ip,
                    port: this.port,
                    protocol: "https:",
                    path: "/help",
                    ca: cert
               }, (res) => {
                    let body = ""
     
                    res.on("data", (data) => body += data)
                       .on("end", () => resolve(body))
               })
          }))

          return Object.keys(res.events)
     }
}


export interface LeagueWebSocket extends EventEmitter {
     on: (event: keyof WSEvents, listener: (type: EVENT_TYPE, uri: string, ...args: any[]) => any) => this
     once: (event: keyof WSEvents, listener: (type: EVENT_TYPE, uri: string,  ...args: any[]) => any) => this
     emit: (event: keyof WSEvents, type: EVENT_TYPE, uri: string,  ...args: any[]) => boolean
}

export enum EVENT_TYPE {
     CREATE,
     UPDATE,
     DELETE
}