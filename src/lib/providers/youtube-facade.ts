/**
 * YouTube facade: poster + play button, the real iframe is inserted only on
 * click — an embedded page ships zero YouTube requests until the visitor
 * chooses to play. The pasted script reads its player base from data-* on its
 * own tag, so start/end time and other params survive.
 */

export function posterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

export function facadeSnippet(embedUrl: string, videoId: string, label: string): string {
  const img = posterUrl(videoId);
  const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return [
    `<div class="yt-facade" data-src="${embedUrl}" role="button" tabindex="0" aria-label="${label}" style="position:relative;aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;cursor:pointer">`,
    `  <img src="${img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.onerror=null;this.src='${fallback}'">`,
    `  <svg viewBox="0 0 48 48" width="68" height="68" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="rgba(0,0,0,.6)"/><path d="M19 14l16 10-16 10z" fill="#fff"/></svg>`,
    `</div>`,
    `<script>document.querySelectorAll('.yt-facade').forEach(function(el){function go(){var f=document.createElement('iframe');f.src=el.dataset.src;f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;f.title=el.getAttribute('aria-label');f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0';el.replaceChildren(f);el.removeAttribute('role');el.removeAttribute('tabindex')}el.addEventListener('click',go);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})})</script>`,
  ].join('\n');
}
