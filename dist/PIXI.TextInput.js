"use strict";

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(receiver);
      }
      return desc.value;
    };
  }
  return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
}

(function(PIXI) {
  var TextInput =
    /*#__PURE__*/
    (function(_PIXI$Container) {
      _inherits(TextInput, _PIXI$Container);

      function TextInput(input_style, box_style) {
        var _this;

        _classCallCheck(this, TextInput);

        _this = _possibleConstructorReturn(
          this,
          _getPrototypeOf(TextInput).call(this)
        );
        _this._input_style = Object.assign(
          {
            position: "absolute",
            background: "none",
            border: "none",
            outline: "none",
            transformOrigin: "0 0",
            lineHeight: "0"
          },
          input_style
        );
        _this._box_generator =
          typeof box_style === "function"
            ? box_style
            : new DefaultBoxGenerator(box_style);
        _this._box_cache = {};
        _this._previous = {};
        _this._dom_added = false;
        _this._dom_visible = true;
        _this._placeholder = "";
        _this._placeholderColor = 0xa9a9a9;

        _this._createDOMInput();

        _this.substituteText = true;

        _this._setState("DEFAULT");

        _this._addListeners();

        return _this;
      } // GETTERS & SETTERS

      _createClass(TextInput, [
        {
          key: "focus",
          value: function focus() {
            if (this._substituted && !this.dom_visible)
              this._setDOMInputVisible(true);

            this._dom_input.focus();
          }
        },
        {
          key: "setInputStyle",
          value: function setInputStyle(key, value) {
            this._input_style[key] = value;
            this._dom_input.style[key] = value;
            if (
              this._substituted &&
              (key === "fontFamily" || key === "fontSize")
            )
              this._updateFontMetrics();
            if (this._last_renderer) this._update();
          }
        },
        {
          key: "destroy",
          value: function destroy(options) {
            this.destroyBoxCache();

            _get(_getPrototypeOf(TextInput.prototype), "destroy", this).call(
              this,
              options
            );
          } // SETUP
        },
        {
          key: "_createDOMInput",
          value: function _createDOMInput() {
            this._dom_input = document.createElement("input");
            this._dom_input.type = "text";

            for (var key in this._input_style) {
              this._dom_input.style[key] = this._input_style[key];
            }
          }
        },
        {
          key: "_addListeners",
          value: function _addListeners() {
            this.on("added", this._onAdded.bind(this));
            this.on("removed", this._onRemoved.bind(this));

            this._dom_input.addEventListener(
              "keydown",
              this._onInputKeyDown.bind(this)
            );

            this._dom_input.addEventListener(
              "input",
              this._onInputInput.bind(this)
            );

            this._dom_input.addEventListener(
              "keyup",
              this._onInputKeyUp.bind(this)
            );

            this._dom_input.addEventListener(
              "focus",
              this._onFocused.bind(this)
            );

            this._dom_input.addEventListener(
              "blur",
              this._onBlurred.bind(this)
            );
          }
        },
        {
          key: "_onInputKeyDown",
          value: function _onInputKeyDown(e) {
            this.emit("keydown", e.keyCode);
          }
        },
        {
          key: "_onInputInput",
          value: function _onInputInput(e) {
            this.emit("input", this.text);
            if (this._substituted) this._updateSubstitution();
          }
        },
        {
          key: "_onInputKeyUp",
          value: function _onInputKeyUp(e) {
            this.emit("keyup", e.keyCode);
          }
        },
        {
          key: "_onFocused",
          value: function _onFocused() {
            this._setState("FOCUSED");
          }
        },
        {
          key: "_onBlurred",
          value: function _onBlurred() {
            this._setState("DEFAULT");
          }
        },
        {
          key: "_onAdded",
          value: function _onAdded() {
            document.body.appendChild(this._dom_input);
            this._dom_input.style.display = "none";
            this._dom_added = true;
          }
        },
        {
          key: "_onRemoved",
          value: function _onRemoved() {
            document.body.removeChild(this._dom_input);
            this._dom_added = false;
          }
        },
        {
          key: "_setState",
          value: function _setState(state) {
            this.state = state;

            this._updateBox();

            if (this._substituted) this._updateSubstitution();
          } // RENDER & UPDATE
        },
        {
          key: "renderWebGL",
          value: function renderWebGL(renderer) {
            _get(
              _getPrototypeOf(TextInput.prototype),
              "renderWebGL",
              this
            ).call(this, renderer);

            this._render(renderer);
          }
        },
        {
          key: "renderCanvas",
          value: function renderCanvas(renderer) {
            _get(
              _getPrototypeOf(TextInput.prototype),
              "renderCanvas",
              this
            ).call(this, renderer);

            this._render(renderer);
          }
        },
        {
          key: "_render",
          value: function _render(renderer) {
            this._resolution = renderer.resolution;
            this._last_renderer = renderer;
            this._canvas_bounds = this._getCanvasBounds();
            if (this._needsUpdate()) this._update();
          }
        },
        {
          key: "_update",
          value: function _update() {
            this._updateDOMInput();

            if (this._substituted) this._updateSurrogate();

            this._updateBox();
          }
        },
        {
          key: "_updateBox",
          value: function _updateBox() {
            if (this._needsNewBoxCache()) this._buildBoxCache();
            if (
              this.state == this._previous.state &&
              this._box == this._box_cache[this.state]
            )
              return;
            if (this._box) this.removeChild(this._box);
            this._box = this._box_cache[this.state];
            this.addChildAt(this._box, 0);
            this._previous.state = this.state;
          }
        },
        {
          key: "_updateSubstitution",
          value: function _updateSubstitution() {
            if (this.state === "FOCUSED") {
              this._dom_visible = true;
              this._surrogate.visible = this.text.length === 0;
            } else {
              this._dom_visible = false;
              this._surrogate.visible = true;
            }

            this._updateDOMInput();

            this._updateSurrogate();
          }
        },
        {
          key: "_updateDOMInput",
          value: function _updateDOMInput() {
            if (!this._canvas_bounds) return;
            this._dom_input.style.top = this._canvas_bounds.top + "px";
            this._dom_input.style.left = this._canvas_bounds.left + "px";
            this._dom_input.style.transform = this._pixiMatrixToCSS(
              this._getDOMRelativeWorldTransform()
            );
            this._dom_input.style.opacity = this.worldAlpha;

            this._setDOMInputVisible(this.worldVisible && this._dom_visible);

            this._previous.canvas_bounds = this._canvas_bounds;
            this._previous.world_transform = this.worldTransform.clone();
            this._previous.world_alpha = this.worldAlpha;
            this._previous.world_visible = this.worldVisible;
          } // STATE COMPAIRSON (FOR PERFORMANCE BENEFITS)
        },
        {
          key: "_needsUpdate",
          value: function _needsUpdate() {
            return (
              !this._comparePixiMatrices(
                this.worldTransform,
                this._previous.world_transform
              ) ||
              !this._compareClientRects(
                this._canvas_bounds,
                this._previous.canvas_bounds
              ) ||
              this.worldAlpha != this._previous.world_alpha ||
              this.worldVisible != this._previous.world_visible
            );
          }
        },
        {
          key: "_needsNewBoxCache",
          value: function _needsNewBoxCache() {
            var input_bounds = this._getDOMInputBounds();

            return (
              !this._previous.input_bounds ||
              input_bounds.width != this._previous.input_bounds.width ||
              input_bounds.height != this._previous.input_bounds.height
            );
          } // INPUT SUBSTITUTION
        },
        {
          key: "_createSurrogate",
          value: function _createSurrogate() {
            this._surrogate_hitbox = new PIXI.Graphics();
            this._surrogate_hitbox.interactive = true;
            this._surrogate_hitbox.cursor = "text";

            this._surrogate_hitbox.on(
              "pointerdown",
              this._onSurrogateFocus.bind(this)
            );

            this.addChild(this._surrogate_hitbox);
            this._surrogate_mask = new PIXI.Graphics();
            this.addChild(this._surrogate_mask);
            this._surrogate = new PIXI.Text("", {});
            this.addChild(this._surrogate);
            this._surrogate.mask = this._surrogate_mask;

            this._updateFontMetrics();

            this._updateSurrogate();
          }
        },
        {
          key: "_updateSurrogate",
          value: function _updateSurrogate() {
            var padding = this._deriveSurrogatePadding();

            var input_bounds = this._getDOMInputBounds();

            this._surrogate.style = this._deriveSurrogateStyle();
            this._surrogate.style.padding = Math.max.apply(Math, padding);
            this._surrogate.y =
              (input_bounds.height - this._surrogate.height) / 2;
            this._surrogate.x = padding[3];
            this._surrogate.text = this._deriveSurrogateText();

            this._updateSurrogateHitbox(input_bounds);

            this._updateSurrogateMask(input_bounds, padding);
          }
        },
        {
          key: "_updateSurrogateHitbox",
          value: function _updateSurrogateHitbox(bounds) {
            this._surrogate_hitbox.clear();

            this._surrogate_hitbox.beginFill(0, 0);

            this._surrogate_hitbox.drawRect(0, 0, bounds.width, bounds.height);

            this._surrogate_hitbox.endFill();

            this._surrogate_hitbox.interactive = !this._disabled;
          }
        },
        {
          key: "_updateSurrogateMask",
          value: function _updateSurrogateMask(bounds, padding) {
            this._surrogate_mask.clear();

            this._surrogate_mask.beginFill(0);

            this._surrogate_mask.drawRect(
              padding[3],
              0,
              bounds.width - padding[3] - padding[1],
              bounds.height
            );

            this._surrogate_mask.endFill();
          }
        },
        {
          key: "_destroySurrogate",
          value: function _destroySurrogate() {
            if (!this._surrogate) return;
            this.removeChild(this._surrogate);
            this.removeChild(this._surrogate_hitbox);

            this._surrogate.destroy();

            this._surrogate_hitbox.destroy();

            this._surrogate = null;
            this._surrogate_hitbox = null;
          }
        },
        {
          key: "_onSurrogateFocus",
          value: function _onSurrogateFocus() {
            this._setDOMInputVisible(true); //sometimes the input is not being focused by the mouseclick

            setTimeout(this._ensureFocus.bind(this), 10);
          }
        },
        {
          key: "_ensureFocus",
          value: function _ensureFocus() {
            if (!this._hasFocus()) this.focus();
          }
        },
        {
          key: "_deriveSurrogateStyle",
          value: function _deriveSurrogateStyle() {
            var style = new PIXI.TextStyle();

            for (var key in this._input_style) {
              switch (key) {
                case "color":
                  style.fill = this._input_style.color;
                  break;

                case "fontFamily":
                case "fontSize":
                case "fontWeight":
                case "fontVariant":
                case "fontStyle":
                  style[key] = this._input_style[key];
                  break;
              }
            }

            if (this._dom_input.value.length === 0)
              style.fill = this._placeholderColor;
            return style;
          }
        },
        {
          key: "_deriveSurrogatePadding",
          value: function _deriveSurrogatePadding() {
            if (
              this._input_style.padding &&
              this._input_style.padding.length > 0
            ) {
              var components = this._input_style.padding.trim().split(" ");

              if (components.length == 1) {
                var padding = parseFloat(components[0]);
                return [padding, padding, padding, padding];
              } else if (components.length == 2) {
                var paddingV = parseFloat(components[0]);
                var paddingH = parseFloat(components[1]);
                return [paddingV, paddingH, paddingV, paddingH];
              } else if (components.length == 4) {
                return components.map(function(component) {
                  return parseFloat(component);
                });
              }
            }

            return [0, 0, 0, 0];
          }
        },
        {
          key: "_deriveSurrogateText",
          value: function _deriveSurrogateText() {
            return this._dom_input.value.length === 0
              ? this._placeholder
              : this._dom_input.value;
          }
        },
        {
          key: "_updateFontMetrics",
          value: function _updateFontMetrics() {
            var style = this._deriveSurrogateStyle();

            var font = style.toFontString();
            this._font_metrics = PIXI.TextMetrics.measureFont(font);
          } // CACHING OF INPUT BOX GRAPHICS
        },
        {
          key: "_buildBoxCache",
          value: function _buildBoxCache() {
            this._destroyBoxCache();

            var states = ["DEFAULT", "FOCUSED", "DISABLED"];

            var input_bounds = this._getDOMInputBounds();

            for (var i in states) {
              this._box_cache[states[i]] = this._box_generator(
                input_bounds.width,
                input_bounds.height,
                states[i]
              );
            }

            this._previous.input_bounds = input_bounds;
          }
        },
        {
          key: "_destroyBoxCache",
          value: function _destroyBoxCache() {
            if (this._box) {
              this.removeChild(this._box);
              this._box = null;
            }

            for (var i in this._box_cache) {
              this._box_cache[i].destroy();

              this._box_cache[i] = null;
              delete this._box_cache[i];
            }
          } // HELPER FUNCTIONS
        },
        {
          key: "_hasFocus",
          value: function _hasFocus() {
            return document.activeElement === this._dom_input;
          }
        },
        {
          key: "_setDOMInputVisible",
          value: function _setDOMInputVisible(visible) {
            this._dom_input.style.display = visible ? "block" : "none";
          }
        },
        {
          key: "_getCanvasBounds",
          value: function _getCanvasBounds() {
            var rect = this._last_renderer.view.getBoundingClientRect();

            var bounds = {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            };
            bounds.left += window.scrollX;
            bounds.top += window.scrollY;
            return bounds;
          }
        },
        {
          key: "_getDOMInputBounds",
          value: function _getDOMInputBounds() {
            var remove_after = false;

            if (!this._dom_added) {
              document.body.appendChild(this._dom_input);
              remove_after = true;
            }

            var org_transform = this._dom_input.style.transform;
            var org_display = this._dom_input.style.display;
            this._dom_input.style.transform = "";
            this._dom_input.style.display = "block";

            var bounds = this._dom_input.getBoundingClientRect();

            this._dom_input.style.transform = org_transform;
            this._dom_input.style.display = org_display;
            if (remove_after) document.body.removeChild(this._dom_input);
            return bounds;
          }
        },
        {
          key: "_getDOMRelativeWorldTransform",
          value: function _getDOMRelativeWorldTransform() {
            var canvas_bounds = this._last_renderer.view.getBoundingClientRect();

            var matrix = this.worldTransform.clone();
            matrix.scale(this._resolution, this._resolution);
            matrix.scale(
              canvas_bounds.width / this._last_renderer.width,
              canvas_bounds.height / this._last_renderer.height
            );
            return matrix;
          }
        },
        {
          key: "_pixiMatrixToCSS",
          value: function _pixiMatrixToCSS(m) {
            return "matrix(" + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(",") + ")";
          }
        },
        {
          key: "_comparePixiMatrices",
          value: function _comparePixiMatrices(m1, m2) {
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
          key: "_compareClientRects",
          value: function _compareClientRects(r1, r2) {
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
          key: "substituteText",
          get: function get() {
            return this._substituted;
          },
          set: function set(substitute) {
            if (this._substituted == substitute) return;
            this._substituted = substitute;

            if (substitute) {
              this._createSurrogate();

              this._dom_visible = false;
            } else {
              this._destroySurrogate();

              this._dom_visible = true;
            }

            this.placeholder = this._placeholder;

            this._update();
          }
        },
        {
          key: "placeholder",
          get: function get() {
            return this._placeholder;
          },
          set: function set(text) {
            this._placeholder = text;

            if (this._substituted) {
              this._updateSurrogate();

              this._dom_input.placeholder = "";
            } else {
              this._dom_input.placeholder = text;
            }
          }
        },
        {
          key: "disabled",
          get: function get() {
            return this._disabled;
          },
          set: function set(disabled) {
            this._disabled = disabled;
            this._dom_input.disabled = disabled;

            this._setState(disabled ? "DISABLED" : "DEFAULT");
          }
        },
        {
          key: "text",
          get: function get() {
            return this._dom_input.value;
          },
          set: function set(text) {
            this._dom_input.value = text;
            if (this._substituted) this._updateSurrogate();
          }
        }
      ]);

      return TextInput;
    })(PIXI.Container);

  function DefaultBoxGenerator(styles) {
    styles = styles || {
      fill: 0xcccccc
    };

    if (styles.default) {
      styles.focused = styles.focused || styles.default;
      styles.disabled = styles.disabled || styles.default;
    } else {
      var temp_styles = styles;
      styles = {};
      styles.default = styles.focused = styles.disabled = temp_styles;
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
