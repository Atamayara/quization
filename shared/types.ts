// Player data
export interface Player {
    name: string;
    id: string;
    tappedAt?: number;
    score: number;
    correct: number;
    incorrect: number;
    // life: number; [TODO] Enable lives
    isOnline: boolean;
    state: 'ACTIVE' | 'REST';
}

// Message sent to a server from clients
export type ClientMessage =
    // (Re)Join
    | {
          type: 'C2S_JOIN';
          payload: {
              name?: string;
              id?: string;
              key?: string;
          };
      }

    // Tap to answer
    | {
          type: 'C2S_TAP';
      }

    // Global actions by the host
    | {
          type: 'C2S_HOST_GLOBAL_ACTION';
          payload: {
              action:
                  | 'START_READING'
                  | 'STOP_READING'
                  | 'RESET_READING'
                  | 'NEXT_QUESTION'
                  | 'BEFORE_QUESTION';
          };
      }

    // Actions for a player by the host
    | {
          type: 'C2S_HOST_PLAYER_ACTION';
          payload:
              | {
                    action: 'MARK_CORRECT' | 'MARK_INCORRECT';
                    id: string;
                }
              | {
                    action: 'ADJUST_SCORE';
                    id: string;
                    value: number;
                };
      };

// Message sent to clients from a server
export type ServerMessage =
    // Accept connecting
    | {
          type: 'S2C_JOIN_ACK';
          payload: {
              id: string;
              key: string;
          };
      }
    | {
          type: 'S2C_SET_UI_STATE';
          payload: {
              player: Player;
              // [TODO] Additional UI settings
          };
      }

    // Update view data
    | {
          type: 'S2C_VIEW_UPDATE';
          payload: {
              index?: number;
              question?: string;
              answer?: string;
              speed?: number; // Char per seconds (-1: immediately)
              players?: Player[];
          };
      }

    // Action for view
    | {
          type: 'S2C_VIEW_ACTION';
          payload:
              | {
                    action: 'START_READING' | 'STOP_READING' | 'END_READING';
                }
              | {
                    action: 'CORRECT' | 'INCORRECT';
                    id: string;
                };
      };
