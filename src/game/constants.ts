// Window size
export const WINXSIZE = 800;
export const WINYSIZE = 600;
// Field size
export const AREAXSIZE = 8.0;
export const AREAYSIZE = 12.0;
export const AREAZSIZE = 6.0;

// Player size
export const UPPERARM = 0.25;
export const FOREARM = 0.30;

// Table size
export const TABLELENGTH = 2.74;
export const TABLEWIDTH = 1.525;
export const TABLEHEIGHT = 0.76;
export const TABLETHICK = 0.1;
// Net height
export const NETHEIGHT = 0.1525;
// Ball R
export const BALL_R = 0.019;

export const TABLE_E = 0.8;
export const PHY = 0.15;

export const GRAVITY = (spin: number) => -9.8 + spin * 5;

export const TICK = 0.01; // Turn length (in second)

// Play mode
export const MODE_SOLOPLAY = 1; // Play VS COM
export const MODE_MULTIPLAY = 2; // Play VS MAN
export const MODE_SELECT = 3; // Player Select
export const MODE_TITLE = 4; // Title
export const MODE_HOWTO = 5; // How to Play
export const MODE_TRAININGSELECT = 6; // Training Select
export const MODE_TRAINING = 7; // Training
export const MODE_OPENING = 8; // Opening
export const MODE_PRACTICESELECT = 9; // Practice Select
export const MODE_PRACTICE = 10; // Practice
export const MODE_MULTIPLAYSELECT = 11; // Play VS MAN Select
export const MODE_LOGPLAY = 12; // Log file player mode

// Player
// m_playerType
export const PLAYER_PROTO = 0;
export const PLAYER_PENATTACK = 1;
export const PLAYER_SHAKECUT = 2;
export const PLAYER_PENDRIVE = 3;

// m_swingType
export const SWING_NORMAL = 0;
export const SWING_POKE = 1;
export const SWING_SMASH = 2;
export const SWING_DRIVE = 3;
export const SWING_CUT = 4;
export const SWING_BLOCK = 5;

export const SERVE_MIN = 65536;
export const SERVE_MAX = SERVE_MIN + 3;

export const SERVE_NORMAL = SERVE_MIN + 0;
export const SERVE_POKE = SERVE_MIN + 1;
export const SERVE_SIDESPIN1 = SERVE_MIN + 2;
export const SERVE_SIDESPIN2 = SERVE_MIN + 3;

// Player parameters
export const PLAYER_ACCEL_LIMIT = [0.8, 0.7, 0.6, 0.5];
export const PLAYER_MAX_FOREHAND_SPEED = [15.0, 15.0, 25.0, 15.0, 15.0, 15.0];
export const PLAYER_MAX_BACKHAND_SPEED = [12.0, 12.0, 18.0, 12.0, 12.0, 12.0];
export const PLAYER_DIFF_COEFF = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

export const PLAYER_SERVE_PARAM = [
  [SERVE_NORMAL, 0.0, 0.0, 0.0, 0.1, 0.0, 0.2],
  [SERVE_POKE, 0.0, 0.0, 0.0, -0.3, 0.0, -0.6],
  [SERVE_SIDESPIN1, -0.6, 0.2, -0.8, 0.0, -0.6, -0.2],
  [SERVE_SIDESPIN2, 0.6, 0.2, 0.8, 0.0, 0.6, -0.2],
  [-1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

export const SWING_PERFECT = 0;
export const SWING_GREAT = 1;
export const SWING_GOOD = 2;
export const SWING_BOO = 3;
export const SWING_MISS = 4;
