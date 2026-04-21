// src/lib/inAppBrowser.js
// Detecta se a página está dentro de um WebView in-app (Instagram, TikTok, etc.).
// OAuth Google recusa esses UAs com 403 disallowed_useragent — este detector é
// usado em AuthContext para mostrar aviso ao user antes de tentar o login.

const IN_APP_UA_RE = /FBAN|FBAV|FBIOS|FB_IAB|FB4A|Messenger|Instagram|Twitter|Line|MicroMessenger|LinkedInApp|Snapchat|musical_ly|Bytedance|TikTok|\bwv\b/i;

export function detectInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return IN_APP_UA_RE.test(navigator.userAgent || '');
}
