import { CasoClinico, EventoRisco, Fornecedor, HospitalParceiro, StockItem } from '../data/mockData';

export class DatabaseService {
  static async initialize(): Promise<void> {
    return Promise.resolve();
  }

  static async getItems(): Promise<StockItem[]> {
    return Promise.resolve([]);
  }

  static async insertItem(_item: StockItem): Promise<void> {
    return Promise.resolve();
  }

  static async getFornecedores(): Promise<Fornecedor[]> {
    return Promise.resolve([]);
  }

  static async insertFornecedor(_fornecedor: Fornecedor): Promise<void> {
    return Promise.resolve();
  }

  static async getHospitais(): Promise<HospitalParceiro[]> {
    return Promise.resolve([]);
  }

  static async insertHospital(_hospital: HospitalParceiro): Promise<void> {
    return Promise.resolve();
  }

  static async getEventosRisco(): Promise<EventoRisco[]> {
    return Promise.resolve([]);
  }

  static async insertEventoRisco(_evento: EventoRisco): Promise<void> {
    return Promise.resolve();
  }

  static async getCasosClinicos(): Promise<CasoClinico[]> {
    return Promise.resolve([]);
  }

  static async insertCasoClinico(_caso: CasoClinico): Promise<void> {
    return Promise.resolve();
  }
}
