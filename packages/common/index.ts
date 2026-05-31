export type EngineRequest = 
    | OnrampRequest 
    | CreateOrderRequest
    | CancelOrderRequest
    | CreateMarketRequest

export interface OnrampRequest {
  messageType: "onramp";
  userId: string;
  amount: string;
}

export interface CreateOrderRequest {
  messageType: "create_order";
  userId: string;
  marketId: string;
  side: "LONG" | "SHORT";
  price: string;
  type: "LIMIT" | "MARKET";
  qty: string;
  equity: string;
  orderId: string;
}

export interface CancelOrderRequest {
    messageType: "cancel_order";
    orderId: string;
    userId: string;
}

export interface CreateMarketRequest {
    messageType: "create_market";
    marketId: string;
}