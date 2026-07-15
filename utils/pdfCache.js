import { Platform } from 'react-native';

// expo-file-system has no web implementation for local storage — web always
// falls through to the remote URL, same limitation already documented for
// this feature (browsers have no persistent filesystem access).
let File, Paths;
if (Platform.OS !== 'web') {
  ({ File, Paths } = require('expo-file-system'));
}

function localFileFor(remoteUrl) {
  const filename = remoteUrl.split('/').pop();
  return new File(Paths.document, 'pdf-cache', filename);
}

/**
 * Returns a local file:// URI for `remoteUrl`, downloading it into the app's
 * document directory first if it isn't already cached. Falls back to
 * `remoteUrl` itself (so the caller's WebView still tries the network) if
 * caching isn't possible — e.g. on web, or if the download fails while
 * offline and no local copy exists yet.
 */
export async function getLocalPdfUri(remoteUrl) {
  if (Platform.OS === 'web' || !remoteUrl) return remoteUrl;

  try {
    const file = localFileFor(remoteUrl);
    if (file.exists) return file.uri;

    file.parentDirectory.create({ intermediates: true, idempotent: true });
    const downloaded = await File.downloadFileAsync(remoteUrl, file, { idempotent: true });
    return downloaded.uri;
  } catch {
    // Offline with nothing cached yet, or a genuine download error — let the
    // caller fall back to the remote URL (which will simply fail to load
    // offline, same as before this feature existed).
    return remoteUrl;
  }
}
