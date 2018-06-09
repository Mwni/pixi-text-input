"use strict";

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var _get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

(function(PIXI) {
  var TextInput = (function(_PIXI$Container) {
    _inherits(TextInput, _PIXI$Container);

    function TextInput(input_style, box_style) {
      _classCallCheck(this, TextInput);

      var _this = _possibleConstructorReturn(
        this,
        (TextInput.__proto__ || Object.getPrototypeOf(TextInput)).call(this)
      );

      _this.input_style = Object.assign(
        {
          position: "absolute",
          background: "none",
          border: "none",
          outline: "none",
          transformOrigin: "0 0"
        },
        input_style
      );
      _this.box_generator =
        typeof box_style === "function"
          ? box_style
          : new DefaultBoxGenerator(box_style);
      _this.box_cache = {};
      _this.state = "IDLE";
      _this.previous = {};
      _this.dom_added = false;
      _this.createDOMInput();
      _this.updateBox();
      _this.addListeners();
      return _this;
    }

    // GETTERS & SETTERS

    _createClass(TextInput, [
      {
        key: "focus",
        value: function focus() {
          this.dom_input.focus();
        }
      },
      {
        key: "setInputStyle",
        value: function setInputStyle(key, value) {
          this.input_style[key] = value;
          this.dom_input.style[key] = value;
          if (this.last_renderer) this.update(this.last_renderer);
        }
      },
      {
        key: "destroy",
        value: function destroy(options) {
          this.destroyBoxCache();
          _get(
            TextInput.prototype.__proto__ ||
              Object.getPrototypeOf(TextInput.prototype),
            "destroy",
            this
          ).call(this, options);
        }

        // SETUP
      },
      {
        key: "createDOMInput",
        value: function createDOMInput() {
          var _this2 = this;

          this.dom_input = document.createElement("input");
          this.dom_input.type = "text";
          for (var key in this.input_style) {
            this.dom_input.style[key] = this.input_style[key];
          }

          this.dom_input.addEventListener("focus", function() {
            return _this2.setState("ACTIVE");
          });
          this.dom_input.addEventListener("blur", function() {
            return _this2.setState("IDLE");
          });
        }
      },
      {
        key: "addListeners",
        value: function addListeners() {
          this.on("added", this.onAdded.bind(this));
          this.on("removed", this.onRemoved.bind(this));
        }
      },
      {
        key: "onAdded",
        value: function onAdded() {
          document.body.appendChild(this.dom_input);
          this.dom_input.style.display = "none";
          this.dom_added = true;
        }
      },
      {
        key: "onRemoved",
        value: function onRemoved() {
          console.log("removed");
          document.body.removeChild(this.dom_input);
          this.dom_added = false;
        }
      },
      {
        key: "setState",
        value: function setState(state) {
          this.state = state;
          this.updateBox();
        }

        // RENDER & UPDATE
      },
      {
        key: "renderWebGL",
        value: function renderWebGL(renderer) {
          _get(
            TextInput.prototype.__proto__ ||
              Object.getPrototypeOf(TextInput.prototype),
            "renderWebGL",
            this
          ).call(this, renderer);
          this.update(renderer);
        }
      },
      {
        key: "renderCanvas",
        value: function renderCanvas(renderer) {
          _get(
            TextInput.prototype.__proto__ ||
              Object.getPrototypeOf(TextInput.prototype),
            "renderCanvas",
            this
          ).call(this, renderer);
          this.update(renderer);
        }
      },
      {
        key: "update",
        value: function update(renderer) {
          this.resolution = renderer.resolution;
          this.last_renderer = renderer;
          this.canvas_bounds = this.getCanvasBounds();

          if (!this.needsUpdate()) return;

          this.updateDOMInput();
          this.updateBox();
        }
      },
      {
        key: "updateBox",
        value: function updateBox() {
          if (this.needsNewBoxCache()) this.buildBoxCache();

          if (
            this.state == this.previous.state &&
            this.box == this.box_cache[this.state]
          )
            return;

          if (this.box) this.removeChild(this.box);

          this.box = this.box_cache[this.state];
          this.addChild(this.box);
          this.previous.state = this.state;
        }
      },
      {
        key: "updateDOMInput",
        value: function updateDOMInput() {
          this.dom_input.style.top = this.canvas_bounds.top + "px";
          this.dom_input.style.left = this.canvas_bounds.left + "px";
          this.dom_input.style.transform = this.pixiMatrixToCSS(
            this.getDOMRelativeWorldTransform()
          );
          this.dom_input.style.opacity = this.worldAlpha;
          this.dom_input.style.display = this.worldVisible ? "block" : "none";

          this.previous.canvas_bounds = this.canvas_bounds;
          this.previous.world_transform = this.worldTransform.clone();
          this.previous.world_alpha = this.worldAlpha;
          this.previous.world_visible = this.worldVisible;
        }

        // STATE COMPAIRSON (FOR PERFORMANCE BENEFITS)
      },
      {
        key: "needsUpdate",
        value: function needsUpdate() {
          return (
            !this.comparePixiMatrices(
              this.worldTransform,
              this.previous.world_transform
            ) ||
            !this.compareClientRects(
              this.canvas_bounds,
              this.previous.canvas_bounds
            ) ||
            this.worldAlpha != this.previous.world_alpha ||
            this.worldVisible != this.previous.world_visible ||
            this.needsNewBoxCache()
          );
        }
      },
      {
        key: "needsNewBoxCache",
        value: function needsNewBoxCache() {
          var input_bounds = this.getDOMInputBounds();
          return (
            !this.previous.input_bounds ||
            input_bounds.width != this.previous.input_bounds.width ||
            input_bounds.height != this.previous.input_bounds.height
          );
        }

        // CACHING OF INPUT BOX GRAPHICS
      },
      {
        key: "buildBoxCache",
        value: function buildBoxCache() {
          this.destroyBoxCache();

          var states = ["IDLE", "ACTIVE", "DISABLED"];
          var input_bounds = this.getDOMInputBounds();

          for (var i in states) {
            this.box_cache[states[i]] = this.box_generator(
              input_bounds.width,
              input_bounds.height,
              states[i]
            );
          }

          this.previous.input_bounds = input_bounds;
        }
      },
      {
        key: "destroyBoxCache",
        value: function destroyBoxCache() {
          if (this.box) {
            this.removeChild(this.box);
            this.box = null;
          }
          for (var i in this.box_cache) {
            this.box_cache[i].destroy();
            this.box_cache[i] = null;
            delete this.box_cache[i];
          }
        }

        // HELPER FUNCTIONS
      },
      {
        key: "getCanvasBounds",
        value: function getCanvasBounds() {
          return this.last_renderer.view.getBoundingClientRect();
        }
      },
      {
        key: "getDOMInputBounds",
        value: function getDOMInputBounds() {
          var remove_after = false;

          if (!this.dom_added) {
            document.body.appendChild(this.dom_input);
            remove_after = true;
          }

          var org_transform = this.dom_input.style.transform;
          this.dom_input.style.transform = "";
          var bounds = this.dom_input.getBoundingClientRect();
          this.dom_input.style.transform = org_transform;

          if (remove_after) document.body.removeChild(this.dom_input);

          return bounds;
        }
      },
      {
        key: "getDOMInputLocalBounds",
        value: function getDOMInputLocalBounds() {
          var bounds = this.getDOMInputBounds();
          bounds.width *= this.scale.x;
          bounds.height *= this.scale.y;
          return bounds;
        }
      },
      {
        key: "getDOMRelativeWorldTransform",
        value: function getDOMRelativeWorldTransform() {
          var canvas_bounds = this.last_renderer.view.getBoundingClientRect();
          var matrix = this.worldTransform.clone();
          matrix.scale(this.resolution, this.resolution);
          matrix.scale(
            canvas_bounds.width / this.last_renderer.width,
            canvas_bounds.height / this.last_renderer.height
          );
          return matrix;
        }
      },
      {
        key: "pixiMatrixToCSS",
        value: function pixiMatrixToCSS(m) {
          return "matrix(" + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(",") + ")";
        }
      },
      {
        key: "comparePixiMatrices",
        value: function comparePixiMatrices(m1, m2) {
          if (!m1 || !m2) return false;
          return (
            m1.a == m2.a &&
            m1.b == m2.b &&
            m1.c == m2.c &&
            m1.d == m2.d &&
            m1.tx == m2.tx &&
            m1.ty == m2.ty
          );
        }
      },
      {
        key: "compareClientRects",
        value: function compareClientRects(r1, r2) {
          if (!r1 || !r2) return false;
          return (
            r1.left == r2.left &&
            r1.top == r2.top &&
            r1.width == r2.width &&
            r1.height == r2.height
          );
        }
      },
      {
        key: "placeholder",
        get: function get() {
          return this.dom_input.placeholder;
        },
        set: function set(text) {
          this.dom_input.placeholder = text;
        }
      },
      {
        key: "disabled",
        get: function get() {
          return this._disabled;
        },
        set: function set(disabled) {
          this._disabled = disabled;
          this.dom_input.disabled = disabled;
          this.setState(disabled ? "DISABLED" : "IDLE");
        }
      },
      {
        key: "text",
        get: function get() {
          return this.dom_input.value;
        },
        set: function set(text) {
          this.dom_input.value = text;
        }
      }
    ]);

    return TextInput;
  })(PIXI.Container);

  function DefaultBoxGenerator(styles) {
    styles = styles || { fill: 0xcccccc };
    if (styles.idle) {
      styles.active = styles.active || styles.idle;
      styles.disabled = styles.disabled || styles.idle;
    } else {
      var temp_styles = styles;
      styles = {};
      styles.idle = styles.active = styles.disabled = temp_styles;
    }
    return function(w, h, state) {
      var style = styles[state.toLowerCase()];
      var box = new PIXI.Graphics();

      if (style.fill) box.beginFill(style.fill);

      if (style.stroke)
        box.lineStyle(
          style.stroke.width || 1,
          style.stroke.color || 0,
          style.stroke.alpha || 1
        );

      if (style.rounded) box.drawRoundedRect(0, 0, w, h, style.rounded);
      else box.drawRect(0, 0, w, h);

      box.endFill();
      box.closePath();

      return box;
    };
  }

  PIXI.TextInput = TextInput;
})(PIXI);
