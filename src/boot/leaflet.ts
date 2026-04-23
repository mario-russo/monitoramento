import { defineBoot } from '#q-app/wrappers';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

export default defineBoot(() => {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl,
    shadowUrl,
  });
});
