/* Semantic target IDs shared by lessons, MOA, procedures, and scene cameras.
 * Scene-local anchors are resolved by the scene that owns the geometry.
 * An anchor is a semantic identifier, never a screen coordinate. */
(function (root) {
  "use strict";
  var definitions = {
    "cell.whole": { scene: "cell", anchor: "whole", view: "whole" },
    "cell.nucleus": { scene: "cell", anchor: "nucleus", view: "whole" },
    "cell.mitochondria": { scene: "cell", anchor: "mito", view: "whole" },
    "cell.er": { scene: "cell", anchor: "rer", view: "whole" },
    "cell.golgi": { scene: "cell", anchor: "golgi", view: "whole" },
    "membrane.overview": { scene: "cell", anchor: "membrane", view: "zoom" },
    "membrane.nak_atpase": { scene: "cell", anchor: "pump", view: "zoom" },
    "membrane.nav": { scene: "cell", anchor: "nav", view: "zoom" },
    "membrane.kir": { scene: "cell", anchor: "kir", view: "zoom" },
    "membrane.aqp": { scene: "cell", anchor: "aqp", view: "zoom" },
    "heart.whole": { scene: "body", anchor: "heart" },
    "lung.whole": { scene: "vent", anchor: "lung" },
    "lung.alveolus": { scene: "vent", anchor: "alveolus" },
    "brain.whole": { scene: "body", anchor: "brain" }
  };
  Object.keys(definitions).forEach(function (key) { Object.freeze(definitions[key]); });
  Object.freeze(definitions);

  function resolve(key, sceneAnchors) {
    var definition = definitions[key];
    if (!definition) return null;
    var anchor = sceneAnchors && sceneAnchors[definition.anchor];
    return { id: key, scene: definition.scene, view: definition.view || null,
      anchor: definition.anchor, position: anchor || null };
  }

  root.__CCCameraTargets = Object.freeze({ definitions: definitions, resolve: resolve });
})(window);
