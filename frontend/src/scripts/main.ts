/// <reference path="../../typings/index.d.ts" />
import { SceneManager } from "./scene_manager";
import { ExtendedMesh, ExtendedMeshBasicMaterial } from "./interfaces";
import { processJSONInput, Preprocessor } from './preprocessor';
import { Building } from './blocks';

$(document).ready(() => {
  SceneManager.initialize();

  $("input[type=file]").on('change', (e) => processJSONInput(<HTMLInputElement>e.target));

  $('input[name="filter-type"]').on('change', (e) => {
    let val = $('input[name="filter-type"]:checked').val();
    let l = SceneManager.objects.length;

    for (var i = 0; i < l; i++) {
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        SceneManager.determineVisibility(SceneManager.objects[i], block, val);
      }
    }
  });

  $('#class-extends').on('change', (e) => {
    $('#class-implements').val('');

    let val = $('#class-extends').val();
    let l = SceneManager.objects.length;

    for (let i = 0; i < l; i++) {
      let object = SceneManager.objects[i];
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        object.material.color.setHex(block.data.extends == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
        object.material.defaultColor = block.data.extends == val ? 0xeead12 : object.material.originalColor;
      }
    }
  });

  $('#class-implements').on('change', (e) => {
    $('#class-extends').val('');

    let val = $('#class-implements').val();
    let l = SceneManager.objects.length;

    for (let i = 0; i < l; i++) {
      let object = SceneManager.objects[i];
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        object.material.color.setHex(block.data.implements == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
        object.material.defaultColor = block.data.implements == val ? 0xeead12 : object.material.originalColor;
      }
    }
  });

  $('#settings-form').on('submit', (e) => {
    e.preventDefault();
    SceneManager.preprocessor.processJSON();
  });

  $('#demo-project-select').on('change', (e) => {
    let projectName = $('#demo-project-select').val();

    $.getJSON(`./data/${projectName}.json`, (data) => {
      let preprocessor = new Preprocessor(data);
      SceneManager.preprocessor = preprocessor;

      preprocessor.processJSON(projectName);
    });
  });
});