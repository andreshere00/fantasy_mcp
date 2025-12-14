import type {
    AvailableBalancePort,
    AvailableMarketPlayersPort,
    OpponentsInfoPort,
    SquadPlayersPort,
  } from '../../../domain/fantasy/ports.js';
  
  export interface UserContextSnapshot {
    availableBalance: number;
    squadPlayers: Awaited<ReturnType<SquadPlayersPort['getSquadPlayers']>>;
    availableMarketPlayers: Awaited<ReturnType<AvailableMarketPlayersPort['getAvailableMarketPlayers']>>;
    opponentsInfo: Awaited<ReturnType<OpponentsInfoPort['getOpponentsInfo']>>;
  }
  
  export const getUserContextSnapshot = async (deps: {
    balance: AvailableBalancePort;
    squad: SquadPlayersPort;
    market: AvailableMarketPlayersPort;
    opponents: OpponentsInfoPort;
  }): Promise<UserContextSnapshot> => {
    const availableBalance = await deps.balance.getAvailableBalance();
    const squadPlayers = await deps.squad.getSquadPlayers();
    const availableMarketPlayers = await deps.market.getAvailableMarketPlayers();
    const opponentsInfo = await deps.opponents.getOpponentsInfo();
  
    return { availableBalance, squadPlayers, availableMarketPlayers, opponentsInfo };
  };