// Player data
export interface Player {
    name: string;
    id: string;
    tappedAt: number | null;
    score: number;
    correct: number;
    incorrect: number;
    // life: number; [TODO] Enable lives
    isOnline: boolean;
    restCount: number;
    state: 'ACTIVE' | 'REST';
}

// Quiz settings
export type QuizSettingsUpdate = {
    speed?: number;
    correct?: number;
    incorrect?: number;
};

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
                  | 'PAUSE_READING'
                  | 'STOP_READING'
                  | 'NEXT_QUESTION'
                  | 'BEFORE_QUESTION'
                  | 'RESET_TAP_STATE';
          };
      }

    // Change settings by the host
    | {
          type: 'C2S_HOST_CHANGE_SETTINGS';
          payload: QuizSettingsUpdate;
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
              correct?: number;
              incorrect?: number;
          };
      }

    // Action for view
    | {
          type: 'S2C_VIEW_ACTION';
          payload:
              | {
                    action:
                        | 'START_READING'
                        | 'STOP_READING'
                        | 'PAUSE_READING'
                        | 'RESET_TAP_STATE';
                }
              | {
                    action: 'TAP' | 'CORRECT' | 'INCORRECT';
                    id: string;
                };
      };
