import type { EngineRequest } from "common"
import { client, subscriber } from "./redis";

const BACKEND_CONSUMER_GROUP = `backend-${Date.now()}`;


const loopbackRequests = new Map<string, { resolve: Function, timeout: NodeJS.Timeout }>();

export function loopback(message: EngineRequest) {
    return new Promise(async (resolve, reject) => {
        const loopbackId = crypto.randomUUID();
        const timeout = setTimeout(() => {
            if (loopbackRequests.get(loopbackId)) {
                loopbackRequests.delete(loopbackId);
                reject(new Error("Engine timeout"));
            }
        }, 10000)
        loopbackRequests.set(loopbackId, { resolve, timeout });
        await client.xAdd("engine-request", "*", {loopbackId, ...message});
    })
}

async function main() {
    while (true) {
        const response = await subscriber.xReadGroup(BACKEND_CONSUMER_GROUP, BACKEND_CONSUMER_GROUP, [{ // each backend has its own consumer group
            key: "engine-response",
            id: ">"
        }], {
            BLOCK: 0,
            COUNT: 1
        });
    
        if (!response) {
            continue;
        }
        
        const message: { loopbackId: string } = response[0].messages[0].message;
        const request = loopbackRequests.get(message.loopbackId)

        if (request) {
            clearTimeout(request.timeout)
            request.resolve(message);
            loopbackRequests.delete(message.loopbackId);
        }
    }
}

main();