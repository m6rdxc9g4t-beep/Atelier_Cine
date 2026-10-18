import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
let ffprobeAvailable; // mis en cache après la 1re tentative

/**
 * Lit durée, résolution, HDR, pistes audio/sous-titres via ffprobe.
 * Retourne null si ffprobe n'est pas installé ou si le fichier est illisible —
 * le scan continue alors avec les infos déduites du nom de fichier.
 */
export async function probeFile(filePath) {
  if (ffprobeAvailable === false) return null;
  try {
    const { stdout } = await run(
      'ffprobe',
      ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', filePath],
      { timeout: 20_000, maxBuffer: 10 * 1024 * 1024 },
    );
    ffprobeAvailable = true;
    return summarize(JSON.parse(stdout));
  } catch (err) {
    if (err.code === 'ENOENT') ffprobeAvailable = false;
    return null;
  }
}

export function summarize(data) {
  const streams = data.streams ?? [];
  const video = streams.find((s) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1);
  const duration = Number(data.format?.duration);

  const quality = [];
  if (video?.height) {
    if (video.height >= 2000 || video.width >= 3800) quality.push('4K Ultra HD');
    else if (video.height >= 1000) quality.push('1080p');
    else if (video.height >= 700) quality.push('720p');
    else quality.push('SD');
  }
  if (['smpte2084', 'arib-std-b67'].includes(video?.color_transfer)) quality.push('HDR');

  return {
    durationMin: Number.isFinite(duration) ? Math.round(duration / 60) : null,
    quality,
    tech: {
      container: data.format?.format_name ?? null,
      videoCodec: video?.codec_name ?? null,
      width: video?.width ?? null,
      height: video?.height ?? null,
      audio: streams
        .filter((s) => s.codec_type === 'audio')
        .map((s) => ({ index: s.index, codec: s.codec_name, lang: s.tags?.language ?? null, channels: s.channels })),
      subtitles: streams
        .filter((s) => s.codec_type === 'subtitle')
        .map((s) => ({ index: s.index, codec: s.codec_name, lang: s.tags?.language ?? null })),
    },
  };
}
