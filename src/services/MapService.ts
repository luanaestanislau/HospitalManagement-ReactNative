// src/services/MapService.ts (NOVO)

export interface Location {
  latitude: number;
  longitude: number;
}

export class MapService {
  
  static calculateRoute(origin: Location, destination: Location): Location[] {
    const latStep = (destination.latitude - origin.latitude) / 10;
    const lngStep = (destination.longitude - origin.longitude) / 10;

    const route: Location[] = [origin];
    for (let i = 1; i < 10; i++) {
      route.push({
        latitude: origin.latitude + latStep * i,
        longitude: origin.longitude + lngStep * i,
      });
    }
    route.push(destination);
    return route;
  }

 
  static getStatusColor(status: string): string {
    switch (status) {
      case 'atrasado':
        return '#FF4444';
      case 'em_rota':
        return '#4CAF50';
      case 'entregue':
        return '#2196F3';
      case 'extravio_reembolso':
      case 'nao_entregue':
        return '#FF9800';
      default:
        return '#9C27B0';
    }
  }


  static formatLocation(location: Location): string {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
}