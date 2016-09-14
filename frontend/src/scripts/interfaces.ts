import { Building, District, Block } from './blocks'

export interface BuildingData {
  abstract: boolean;
  anonymous: boolean;
  extends: string;
  file: string;
  final: boolean;
  implements: string;
  name: string;
  no_attrs: number;
  no_lines: number;
  no_methods: number;
  trait: boolean;
  type: string;
  [key: string]: string|number|boolean;
}

export interface City {
  districts: { [propName: string]: District };
  buildings: Array<Building>;
}

export interface InputObject extends BuildingData {
  namespace?: string;
}

export interface ExtendedMesh extends THREE.Mesh {
  block: Block;
  material: ExtendedMeshBasicMaterial;
  edges: THREE.EdgesHelper;
}

export interface ExtendedMeshBasicMaterial extends THREE.MeshBasicMaterial {
  defaultColor: number;
  originalColor: number;
}