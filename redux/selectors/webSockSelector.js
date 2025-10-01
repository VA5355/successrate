// store/selectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectSpot = (state) => state.websocket.spot;
export const selectSymbols = (state) => state.websocket.symbols;

// Strikes within ±500 of spot
export const selectFilteredStrikes = createSelector(
  [selectSpot, selectSymbols],
  (spot, symbols) => {
    if (!spot || symbols.length === 0) return [];
    return symbols ; /*.filter(
      (s) => Math.abs(s.strikeNumber - spot) <= 500
    );*/
  }
);
