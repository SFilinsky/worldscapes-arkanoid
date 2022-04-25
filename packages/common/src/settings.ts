export interface Player {
    id: string
    name: string
}

export interface GameRoomSettings {
    player1: Player,
    player2: Player
}

export interface GameSettings {
    initialPoints: number,

    gameRoomWidth: number,
    gameRoomHeight: number,

    platformWidth: number,
    platformHeight: number,
    platformGapFromBorder: number,
    platformDensity: number,
    platformFriction: number,
    platformRestitution: number,

    ballRadius: number,
    ballDensity: number,
    ballRestitution: number,
    ballInitialForce: number
}