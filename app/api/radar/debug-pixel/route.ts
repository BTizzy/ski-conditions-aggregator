import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const outDir = path.resolve(process.cwd(), 'public', 'debug-screenshots');
    try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
    const entry = { ts: Date.now(), ...body };
    const file = path.join(outDir, 'pixel_log.ndjson');
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
