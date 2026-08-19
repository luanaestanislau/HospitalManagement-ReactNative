// Mock implementation - Firebase Messaging not installed
import { AlertItem } from '../data/mockData';

export type PushAlertCallback = (alert: {
  titulo: string;
  descricao: string;
  prioridade: AlertItem['prioridade'];
  tipo: AlertItem['tipo'];
}) => void;

class NotificationService {
  private initialized = false;
  private token: string | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Mock implementation - permissions would be requested here
      console.log('Mock: Notificações inicializadas');
      
      // Mock FCM token
      this.token = 'mock-fcm-token-' + Date.now();
      console.log('Mock FCM Token:', this.token);

      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }

  setupListeners(_onPushAlert: PushAlertCallback, _onNavigateToAlertas: () => void): void {
    // Mock implementation - listeners would be set up here
    console.log('Mock: Listeners de notificação configurados');
  }

  getToken(): string | null {
    return this.token;
  }
}

export default new NotificationService();