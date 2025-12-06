import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/store';

export const useRealTimePrice = (symbol: string) => {
  const { apiKeys } = useStore();
  const [price, setPrice] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const apiKey = apiKeys['finnhub'];
    if (!apiKey || !symbol) return;

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && message.data && message.data.length > 0) {
          // Get the latest trade price
          const latestTrade = message.data[message.data.length - 1];
          setPrice(latestTrade.p);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', symbol: symbol }));
        ws.close();
      }
    };
  }, [symbol, apiKeys]);

  return price;
};
