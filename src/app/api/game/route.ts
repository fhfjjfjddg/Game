import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // In the future, this could fetch dynamic game data,
  // like the "100 new sentences", high scores, or game configurations.
  const gameData = {
    message: "Welcome to Snake Online!",
    version: "1.0.0",
    initialSpeed: 200,
  };

  return NextResponse.json(gameData);
}
