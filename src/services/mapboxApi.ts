import apiService from '../utils/api';

// Mapbox API service
const mapboxApi = {
  // Geocoding
  geocoding: {
    forwardGeocode: async (address: string) => {
      // In a real implementation, you would call the Mapbox API directly
      // Here we're using a proxy API to avoid exposing API keys in the frontend
      return apiService.get(`/api/mapbox/geocoding/forward`, {
        address,
      });
    },
    
    reverseGeocode: async (longitude: number, latitude: number) => {
      return apiService.get(`/api/mapbox/geocoding/reverse`, {
        longitude,
        latitude,
      });
    },
  },
  
  // Directions
  directions: {
    getDirections: async (
      startLng: number,
      startLat: number,
      endLng: number,
      endLat: number,
      mode = 'driving'
    ) => {
      return apiService.get(`/api/mapbox/directions`, {
        startLng,
        startLat,
        endLng,
        endLat,
        mode,
      });
    },
  },
  
  // Health centers
  healthCenters: {
    findNearby: async (longitude: number, latitude: number, radius = 10, types?: string[]) => {
      return apiService.get(`/api/mapbox/places/health-centers`, {
        longitude,
        latitude,
        radius,
        types: types?.join(','),
      });
    },
    
    getDetails: async (placeId: string) => {
      return apiService.get(`/api/mapbox/places/${placeId}`);
    },
  },
  
  // Isochrones (time-based travel distances)
  isochrones: {
    getIsochrone: async (longitude: number, latitude: number, minutes = 15, mode = 'driving') => {
      return apiService.get(`/api/mapbox/isochrones`, {
        longitude,
        latitude,
        minutes,
        mode,
      });
    },
  },
  
  // Static maps
  staticMaps: {
    getStaticMapUrl: (
      longitude: number,
      latitude: number,
      zoom = 14,
      width = 600,
      height = 400,
      markers?: Array<{ lng: number; lat: number; color?: string }>
    ) => {
      // Generate a URL for a static map image
      let url = `/api/mapbox/static-map?longitude=${longitude}&latitude=${latitude}&zoom=${zoom}&width=${width}&height=${height}`;
      
      if (markers && markers.length > 0) {
        const markersParam = markers.map(m => 
          `${m.lng},${m.lat}${m.color ? `,${m.color}` : ''}`
        ).join('|');
        
        url += `&markers=${encodeURIComponent(markersParam)}`;
      }
      
      return url;
    },
  },
};

export default mapboxApi;