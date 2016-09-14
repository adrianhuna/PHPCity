/// <reference path="../../typings/index.d.ts" />

declare var GrowingPacker: any;

import { colorLuminance } from "./helpers";
import { BuildingData, ExtendedMesh, ExtendedMeshBasicMaterial } from "./interfaces";
import { SceneManager } from "./scene_manager";

export abstract class Block {
  protected color: THREE.Color;
  public fit: { x: number, y: number };
  public addWidth: number;

  public w: number = 0;
  public h: number = 0;
  public d: number = 0;
  public depth: number;

  constructor(protected name: string, protected parent: Block) {
    this.depth = parent === null ? 0 : parent.depth + 1;
  }

  abstract render(scene: THREE.Scene, depth: number): void;

  public getColor(): THREE.Color {
    if (!this.color) {
      this.color = new THREE.Color(parseInt(colorLuminance(this.parent.getColor().getHex(), 0.3).substring(1).toUpperCase(), 16));
    }

    return this.color;
  }

  public setColor(color: number) {
    this.color = new THREE.Color(color);
  }

  public getX(): number {
    return (this.parent === null) ? this.fit.x : this.parent.getX() + this.fit.x;
  }

  public getY(): number {
    return (this.parent === null) ? this.fit.y : this.parent.getY() + this.fit.y;
  }

  public getTrackerText() {
    return this.name;
  }
}

export class Building extends Block {
  constructor(public parent: District,
    public data: BuildingData,
    public heightLevels: number[],
    public widthLevels: number[],
    public heightAttr: string,
    public widthAttr: string) {
    super(data.name, parent);

    this.calculateBlockWidth(widthAttr, widthLevels);
    this.calculateBlockHeight(heightAttr, heightLevels);
  }

  private calculateBlockWidth(widthAttr: string, widthLevels: number[]) {
    for (var i = 0; i < 5; i++) {
      if (this.data[widthAttr] <= widthLevels[i]) {
        this.w = (i + 2) + 2;   // +2 as base width; +2 for margin
        this.h = (i + 2) + 2;   // +2 as base width; +2 for margin
        break;
      }
    }
  }

  private calculateBlockHeight(heightAttr: string, heightLevels: number[]) {
    for (let i = 0; i < 5; i++) {
      if (this.data[heightAttr] <= heightLevels[i]) {
        this.d = (i + 1) * 4;
        break;
      }
    }
  }

  public render(scene: THREE.Scene, depth: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0x2f9dbd };

    if (this.data.abstract) {
      options.color = 0x2fbdab;
      options.opacity = 0.5
      options.transparent = true;
    } else if (this.data.type === "interface") {
      options.color = 0x3c2fbd;
    }

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial(options);

    material.defaultColor = <number>options.color;
    material.originalColor = <number>options.color;

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

    var mesh: ExtendedMesh = <ExtendedMesh>new THREE.Mesh(geometry, material);
    mesh.name = this.name ? this.name : '';

    mesh.position.set(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1);
    mesh.scale.set(this.w - 2, this.d, this.h - 2);

    mesh.block = this;

    var edges = new THREE.EdgesHelper(mesh, 0x000000);
    mesh.edges = edges;

    SceneManager.objects.push(mesh);

    scene.add(mesh);
    scene.add(edges);
  }

  public getTrackerText() {
    var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    if (this.data.extends !== null) {
      text += ` extends <em>${this.data.extends}</em><br>`;
    }

    if (this.data.implements !== null) {
      text += ` implements <em>${this.data.implements}</em><br>`;
    }

    return text + `<br>Package: ${this.parent.getQualifiedName()}<br><br>Methods: ${this.data.no_methods}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }
}

export class District extends Block {
  protected children: District[] = [];
  protected buildings: Building[] = [];

  constructor(name: string, height: number, parent: Block) {
    super(name, parent);

    this.d = height;
  }

  public render(scene: THREE.Scene, depth: number) {
    var color = this.getColor().getHex();
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial({ color: color });

    material.defaultColor = material.originalColor = color;

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

    var mesh: ExtendedMesh = <ExtendedMesh>new THREE.Mesh(geometry, material);
    mesh.name = this.name ? this.name : '';

    mesh.position.set(this.getX() - 1 * this.addWidth, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.addWidth);
    mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);

    var edges = new THREE.EdgesHelper(mesh, 0x000000);

    mesh.edges = edges;

    scene.add(mesh);
    scene.add(edges);

    SceneManager.objects.push(mesh);

    mesh.block = this;

    _.each(this.children, (e) => e.render(scene, depth + 1));
    _.each(this.buildings, (e) => e.render(scene, depth + 1))
  }

  public getWidth(): number {
    let packer = new GrowingPacker();

    // if the district is of a top level
    if (this.children.length === 0) {
      let l = this.buildings.length;
      let sorted = _.sortBy(this.buildings, (e) => e.w).reverse();

      packer.fit(sorted);

      this.w = packer.root.w + 2;
      this.h = packer.root.h + 2;
      this.fit = packer.root;

      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];

        for (let j = 0; j < l; j++) {
          if (this.buildings[j].data.file === block.data.file) {
            this.buildings[j].fit = block.fit;
          }
        }
      }
      // if has child districts
    } else if (this.children.length != 0) {
      let l = this.children.length;

      // first calculate w/h on children
      for (let i = 0; i < l; i++) {
        this.childrenWidth();
      }

      let sorted = _.sortBy((<Block[]>this.children).concat(this.buildings), (e) => e.w).reverse();
      packer.fit(sorted);

      this.w = packer.root.w + 2;
      this.h = packer.root.h + 2;
      this.fit = packer.root;

      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];

        for (let j = 0; j < this.buildings.length; j++) {
          if (block instanceof Building && this.buildings[j].data.file === block.data.file) {
            this.buildings[j].fit = block.fit;
          }
        }
      }
    }

    return this.w;
  }

  public childrenWidth() {
    let l = this.children.length;
    let width = 0;

    for (let i = 0; i < l; i++) {
      width += this.children[i].getWidth();
    }

    return width;
  }

  public addBuilding(building: Building) {
    this.buildings.push(building);
  }

  public addChildDistrict(district: District) {
    this.children.push(district);
  }

  public getQualifiedName(): string {
    if (this.parent === null) {
      return '';
    }

    if (this.name == 'none') {
      return '<em>No package</em>';
    }

    return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
  }

  public getChildBuildingsCount(): number {
    var sum = _.reduce(this.children, (memo: number, e: District): number => memo + e.getChildBuildingsCount(), 0);

    return sum + this.buildings.length;
  }

  public getTrackerText() {
    if (this.depth == 0) {
      return `<em>City base</em><br><em>Buildings:</em>${this.getChildBuildingsCount()}`
    }

    return `<em>Package:</em><strong>${this.getQualifiedName()}</strong><br><em>Buildings:</em>${this.getChildBuildingsCount()}`;
  }
}