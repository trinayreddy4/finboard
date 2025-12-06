import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [
      { id: 1, title: 'Test Item 1', value: 100 },
      { id: 2, title: 'Test Item 2', value: 200 },
    ]
  });
}
