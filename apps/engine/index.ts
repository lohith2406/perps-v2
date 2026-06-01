import { client, publisher } from "./redis";
import type { EngineRequest } from "common";

// run once to create group
// client.xGroupCreate("engine", "engine", "$", {
//     MKSTREAM: true
// });

type OpenOrder = {
    userId: string,
    originalOrderId: string,
    qty: string,
    filledQty: string
}

type Bid = {
    availableQty: number,
    openOrders: OpenOrder[]
}

type Ask = {
    availableQty: number,
    openOrders: OpenOrder[]
}

interface Orderbook {
    bids: Map<string, Bid[]>,
    asks: Map<string, Ask[]>,
    marketId: string,
    lastTradedPrice: string,
    markPrice: string
}

type Balance = Map<string, { available: string; locked: string }>

const orderbooks: Map<string, Orderbook> = new Map();
const balances: Balance = new Map();

const positions: Map<string, Map<string, {
    side: "LONG" | "SHORT",
    averagePrice: string,
    qty: string,
    liquidationPrice: string,
    stopLoss: string,
    takeProfit: string,
    equity: string
}>> = new Map()

let exchangeProfit = 0;
let insuranceFund = 0;

async function matching() {
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
            // admin route to initiate a new orderbook
            orderbooks.set(message.marketId, {
                bids: new Map(),
                asks: new Map(),
                marketId: message.marketId,
                lastTradedPrice: "-1",
                markPrice: "-1"
            })
    
            await publisher.xAdd("engine-response", "*", {
                loopbackId: message.loopbackId
            })
        }
    
        if (message.messageType === "onramp") {
            // increase user fiat balance
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
            // create a new order, match if possible
        }
    
        if (message.messageType === "cancel_order") {
            // cancel an open order
        }
    
        if (message.messageType === "get_depth") {
            // get the depth for a market
        }
    
        if (message.messageType === "spot_price_update") {
            // do liquidation checks, stop loss and take profit
        }
    
        if (message.messageType === "get_funding_rate") {
            // get the funding rate based on the diff b/w mark price and last traded price
        }
    }
}

matching();