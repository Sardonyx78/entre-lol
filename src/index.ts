import { exec } from "child_process";
import { LeagueWebSocket } from './WebSocket';

let resPromise: (value: unknown) => void;
export const READY = new Promise(resolve => {
     resPromise = resolve
})

export async function isProcessRunning(): Promise<boolean> {
     return new Promise((resolve, reject) => {
          switch (process.platform) {
               case 'win32':
                    exec('tasklist', async (err, stdout, _stderr) => {
                         if (err) reject(err)

                         resolve(stdout.split("LeagueClientUx").length !== 1 && !!((await getAuth()).token))
                    })
                    break;
               case 'darwin':
                    exec('ps -ax | grep LeagueClientUx', async (err, stdout, _stderr) => {
                         if (err) reject(err)

                         resolve(stdout.split('riotclient-app').length !== 1 && !!((await getAuth()).token))
                    })
          }
     })
};

export async function getAuth(): Promise<{ port: number, token: string }> {
     return new Promise((res, _rej) => {
          exec((process.platform === "win32") ? "wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline" : "ps -A | grep LeagueClientUx", (err, out) => {
               if (err) throw err
               res({
                    port: parseInt(out.match(/--app-port=([0-9]*)/)![1]),
                    token: out.match(/--remoting-auth-token=([\w-_]*)/)![1]
               })
          })
     })
}


export async function createWebSocket() {

     if (process.platform !== "darwin" && process.platform !== "win32") throw new Error("League Of Legends is only available on MacOS and Windows, if you are trying to connect to another ip & port, try to do so via constructing LeagueWebSocket by your own")

     if (!(await isProcessRunning())) throw new Error("League Client wasn't found! Make sure it's open!")

     const auth = await getAuth()

     const res =  new LeagueWebSocket({ auth: Buffer.from(`riot:${auth.token}`).toString("base64"), port: auth.port })

     resPromise(1)

     return res
}

export * from "./WebSocket"
export * from "./WSEvents"
export * from "./cert"