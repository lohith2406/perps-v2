import { client, publisher } from "./redis";
import type { EngineRequest } from "common";

type OpenOrder = {
    userId: string,
    originalOrderId: string,
    qty: string,
    filledQty: string
}

type Ask = {
    availableQty: number,
    openOrders: OpenOrder[]
}

type Bid = {
    availableQty: number,
    openOrders: OpenOrder[]
}

interface Orderbook {
    bids: Map<string, Bid[]>,
    asks: Map<string, Ask[]>,
    marketId: string,
    lastTradedPrice: number
}
type Balance = Map<string, { available: string; locked: string }>

const orderbooks: Orderbook[] = [];
const balances: Balance = new Map();

while (true) {
    const response = await client.xReadGroup("engine", "engine-1", [{
        key: "engine-request",
        id: ">",
    }], {
        BLOCK: 0,
        COUNT: 1
    })

    if (!response) {
        continue;
    }

    const message: { loopbackId: string } & EngineRequest = response[0].messages[0].message;

    if (message.messageType === "create_market") {
        orderbooks.push({
            bids: new Map(),
            asks: new Map(),
            lastTradedPrice: -1,
            marketId: message.marketId
        })

        await publisher.xAdd("engine-response", "*", {
            loopbackId: message.loopbackId
        })
    }

    if (message.messageType === "onramp") {
        const userBalance = balances.get(message.userId);

        if (!userBalance) {
            balances.set(message.userId, {
                available: message.amount,
                locked: "0"
            });
        } else {
            balances.set(message.userId, {
                available: (Number(userBalance.available) + Number(message.amount)).toString(),
                locked: userBalance.locked
            });
        }

        await publisher.xAdd("engine-response", "*", {
            loopbackId: message.loopbackId
        })
    }

    if (message.messageType === "create_order") {

    }

    if (message.messageType === "cancel_order") {

    }
}