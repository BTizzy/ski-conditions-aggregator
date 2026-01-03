import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, data } = body;
    if (!data || typeof data !== 'string') return NextResponse.json({ ok: false, error: 'no data' }, { status: 400 });

    // data is a dataURL like 'data:image/png;base64,....'
    const matches = data.match(/^data:(image\/(png|jpeg));base64,(.*)$/);
    if (!matches) return NextResponse.json({ ok: false, error: 'invalid data url' }, { status: 400 });

    const base64 = matches[3];
    const buffer = Buffer.from(base64, 'base64');

    const outDir = path.join(process.cwd(), 'public', 'debug-screenshots');
    try { fs.mkdirSync(outDir, { recursive: true }); } catch(e) {}
    const filename = `${name || 'screenshot'}_${Date.now()}.png`;
    const outPath = path.join(outDir, filename);
    fs.writeFileSync(outPath, buffer);

    return NextResponse.json({ ok: true, path: `/debug-screenshots/${filename}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
