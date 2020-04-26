"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

(function (pkg) {
  var PIXI = pkg.PIXI;

  var TextInput = /*#__PURE__*/function (_PIXI$Container) {
    _inheritsLoose(TextInput, _PIXI$Container);

    function TextInput(styles) {
      var _this;

      _this = _PIXI$Container.call(this) || this;
      _this._input_style = Object.assign({
        position: 'absolute',
        background: 'none',
        border: 'none',
        outline: 'none',
        transformOrigin: '0 0',
        lineHeight: '1'
      }, styles.input);
      if (styles.box) _this._box_generator = typeof styles.box === 'function' ? styles.box : new DefaultBoxGenerator(styles.box);else _this._box_generator = null;

      if (_this._input_style.hasOwnProperty('multiline')) {
        _this._multiline = !!_this._input_style.multiline;
        delete _this._input_style.multiline;
      } else _this._multiline = false;

      _this._box_cache = {};
      _this._previous = {};
      _this._dom_added = false;
      _this._dom_visible = true;
      _this._placeholder = '';
      _this._placeholderColor = 0xa9a9a9;
      _this._selection = [0, 0];
      _this._restrict_value = '';

      _this._createDOMInput();

      _this.substituteText = true;

      _this._setState('DEFAULT');

      _this._addListeners();

      return _this;
    } // GETTERS & SETTERS


    var _proto = TextInput.prototype;

    _proto.focus = function focus() {
      if (this._substituted && !this.dom_visible) this._setDOMInputVisible(true);

      this._dom_input.focus();
    };

    _proto.blur = function blur() {
      this._dom_input.blur();
    };

    _proto.select = function select() {
      this.focus();

      this._dom_input.select();
    };

    _proto.setInputStyle = function setInputStyle(key, value) {
      this._input_style[key] = value;
      this._dom_input.style[key] = value;
      if (this._substituted && (key === 'fontFamily' || key === 'fontSize')) this._updateFontMetrics();
      if (this._last_renderer) this._update();
    };

    _proto.destroy = function destroy(options) {
      this._destroyBoxCache();

      _PIXI$Container.prototype.destroy.call(this, options);
    } // SETUP
    ;

    _proto._createDOMInput = function _createDOMInput() {
      if (this._multiline) {
        this._dom_input = document.createElement('textarea');
        this._dom_input.style.resize = 'none';
      } else {
        this._dom_input = document.createElement('input');
        this._dom_input.type = 'text';
      }

      for (var key in this._input_style) {
        this._dom_input.style[key] = this._input_style[key];
      }
    };

    _proto._addListeners = function _addListeners() {
      this.on('added', this._onAdded.bind(this));
      this.on('removed', this._onRemoved.bind(this));

      this._dom_input.addEventListener('keydown', this._onInputKeyDown.bind(this));

      this._dom_input.addEventListener('input', this._onInputInput.bind(this));

      this._dom_input.addEventListener('keyup', this._onInputKeyUp.bind(this));

      this._dom_input.addEventListener('focus', this._onFocused.bind(this));

      this._dom_input.addEventListener('blur', this._onBlurred.bind(this));
    };

    _proto._onInputKeyDown = function _onInputKeyDown(e) {
      this._selection = [this._dom_input.selectionStart, this._dom_input.selectionEnd];
      this.emit('keydown', e.keyCode);
    };

    _proto._onInputInput = function _onInputInput(e) {
      if (this._restrict_regex) this._applyRestriction();
      if (this._substituted) this._updateSubstitution();
      this.emit('input', this.text);
    };

    _proto._onInputKeyUp = function _onInputKeyUp(e) {
      this.emit('keyup', e.keyCode);
    };

    _proto._onFocused = function _onFocused() {
      this._setState('FOCUSED');

      this.emit('focus');
    };

    _proto._onBlurred = function _onBlurred() {
      this._setState('DEFAULT');

      this.emit('blur');
    };

    _proto._onAdded = function _onAdded() {
      document.body.appendChild(this._dom_input);
      this._dom_input.style.display = 'none';
      this._dom_added = true;
    };

    _proto._onRemoved = function _onRemoved() {
      document.body.removeChild(this._dom_input);
      this._dom_added = false;
    };

    _proto._setState = function _setState(state) {
      this.state = state;

      this._updateBox();

      if (this._substituted) this._updateSubstitution();
    } // RENDER & UPDATE
    // for pixi v4
    ;

    _proto.renderWebGL = function renderWebGL(renderer) {
      _PIXI$Container.prototype.renderWebGL.call(this, renderer);

      this._renderInternal(renderer);
    } // for pixi v4
    ;

    _proto.renderCanvas = function renderCanvas(renderer) {
      _PIXI$Container.prototype.renderCanvas.call(this, renderer);

      this._renderInternal(renderer);
    } // for pixi v5
    ;

    _proto.render = function render(renderer) {
      _PIXI$Container.prototype.render.call(this, renderer);

      this._renderInternal(renderer);
    };

    _proto._renderInternal = function _renderInternal(renderer) {
      this._resolution = renderer.resolution;
      this._last_renderer = renderer;
      this._canvas_bounds = this._getCanvasBounds();
      if (this._needsUpdate()) this._update();
    };

    _proto._update = function _update() {
      this._updateDOMInput();

      if (this._substituted) this._updateSurrogate();

      this._updateBox();
    };

    _proto._updateBox = function _updateBox() {
      if (!this._box_generator) return;
      if (this._needsNewBoxCache()) this._buildBoxCache();
      if (this.state == this._previous.state && this._box == this._box_cache[this.state]) return;
      if (this._box) this.removeChild(this._box);
      this._box = this._box_cache[this.state];
      this.addChildAt(this._box, 0);
      this._previous.state = this.state;
    };

    _proto._updateSubstitution = function _updateSubstitution() {
      if (this.state === 'FOCUSED') {
        this._dom_visible = true;
        this._surrogate.visible = this.text.length === 0;
      } else {
        this._dom_visible = false;
        this._surrogate.visible = true;
      }

      this._updateDOMInput();

      this._updateSurrogate();
    };

    _proto._updateDOMInput = function _updateDOMInput() {
      if (!this._canvas_bounds) return;
      this._dom_input.style.top = (this._canvas_bounds.top || 0) + 'px';
      this._dom_input.style.left = (this._canvas_bounds.left || 0) + 'px';
      this._dom_input.style.transform = this._pixiMatrixToCSS(this._getDOMRelativeWorldTransform());
      this._dom_input.style.opacity = this.worldAlpha;

      this._setDOMInputVisible(this.worldVisible && this._dom_visible);

      this._previous.canvas_bounds = this._canvas_bounds;
      this._previous.world_transform = this.worldTransform.clone();
      this._previous.world_alpha = this.worldAlpha;
      this._previous.world_visible = this.worldVisible;
    };

    _proto._applyRestriction = function _applyRestriction() {
      if (this._restrict_regex.test(this.text)) {
        this._restrict_value = this.text;
      } else {
        this.text = this._restrict_value;

        this._dom_input.setSelectionRange(this._selection[0], this._selection[1]);
      }
    } // STATE COMPAIRSON (FOR PERFORMANCE BENEFITS)
    ;

    _proto._needsUpdate = function _needsUpdate() {
      return !this._comparePixiMatrices(this.worldTransform, this._previous.world_transform) || !this._compareClientRects(this._canvas_bounds, this._previous.canvas_bounds) || this.worldAlpha != this._previous.world_alpha || this.worldVisible != this._previous.world_visible;
    };

    _proto._needsNewBoxCache = function _needsNewBoxCache() {
      var input_bounds = this._getDOMInputBounds();

      return !this._previous.input_bounds || input_bounds.width != this._previous.input_bounds.width || input_bounds.height != this._previous.input_bounds.height;
    } // INPUT SUBSTITUTION
    ;

    _proto._createSurrogate = function _createSurrogate() {
      this._surrogate_hitbox = new PIXI.Graphics();
      this._surrogate_hitbox.alpha = 0;
      this._surrogate_hitbox.interactive = true;
      this._surrogate_hitbox.cursor = 'text';

      this._surrogate_hitbox.on('pointerdown', this._onSurrogateFocus.bind(this));

      this.addChild(this._surrogate_hitbox);
      this._surrogate_mask = new PIXI.Graphics();
      this.addChild(this._surrogate_mask);
      this._surrogate = new PIXI.Text('', {});
      this.addChild(this._surrogate);
      this._surrogate.mask = this._surrogate_mask;

      this._updateFontMetrics();

      this._updateSurrogate();
    };

    _proto._updateSurrogate = function _updateSurrogate() {
      var padding = this._deriveSurrogatePadding();

      var input_bounds = this._getDOMInputBounds();

      this._surrogate.style = this._deriveSurrogateStyle();
      this._surrogate.style.padding = Math.max.apply(Math, padding);
      this._surrogate.y = this._multiline ? padding[0] : (input_bounds.height - this._surrogate.height) / 2;
      this._surrogate.x = padding[3];
      this._surrogate.text = this._deriveSurrogateText();

      switch (this._surrogate.style.align) {
        case 'left':
          this._surrogate.x = padding[3];
          break;

        case 'center':
          this._surrogate.x = input_bounds.width * 0.5 - this._surrogate.width * 0.5;
          break;

        case 'right':
          this._surrogate.x = input_bounds.width - padding[1] - this._surrogate.width;
          break;
      }

      this._updateSurrogateHitbox(input_bounds);

      this._updateSurrogateMask(input_bounds, padding);
    };

    _proto._updateSurrogateHitbox = function _updateSurrogateHitbox(bounds) {
      this._surrogate_hitbox.clear();

      this._surrogate_hitbox.beginFill(0);

      this._surrogate_hitbox.drawRect(0, 0, bounds.width, bounds.height);

      this._surrogate_hitbox.endFill();

      this._surrogate_hitbox.interactive = !this._disabled;
    };

    _proto._updateSurrogateMask = function _updateSurrogateMask(bounds, padding) {
      this._surrogate_mask.clear();

      this._surrogate_mask.beginFill(0);

      this._surrogate_mask.drawRect(padding[3], 0, bounds.width - padding[3] - padding[1], bounds.height);

      this._surrogate_mask.endFill();
    };

    _proto._destroySurrogate = function _destroySurrogate() {
      if (!this._surrogate) return;
      this.removeChild(this._surrogate);
      this.removeChild(this._surrogate_hitbox);

      this._surrogate.destroy();

      this._surrogate_hitbox.destroy();

      this._surrogate = null;
      this._surrogate_hitbox = null;
    };

    _proto._onSurrogateFocus = function _onSurrogateFocus() {
      this._setDOMInputVisible(true); //sometimes the input is not being focused by the mouseclick


      setTimeout(this._ensureFocus.bind(this), 10);
    };

    _proto._ensureFocus = function _ensureFocus() {
      if (!this._hasFocus()) this.focus();
    };

    _proto._deriveSurrogateStyle = function _deriveSurrogateStyle() {
      var style = new PIXI.TextStyle();

      for (var key in this._input_style) {
        switch (key) {
          case 'color':
            style.fill = this._input_style.color;
            break;

          case 'fontFamily':
          case 'fontSize':
          case 'fontWeight':
          case 'fontVariant':
          case 'fontStyle':
            style[key] = this._input_style[key];
            break;

          case 'letterSpacing':
            style.letterSpacing = parseFloat(this._input_style.letterSpacing);
            break;

          case 'textAlign':
            style.align = this._input_style.textAlign;
            break;
        }
      }

      if (this._multiline) {
        style.lineHeight = parseFloat(style.fontSize);
        style.wordWrap = true;
        style.wordWrapWidth = this._getDOMInputBounds().width;
      }

      if (this._dom_input.value.length === 0) style.fill = this._placeholderColor;
      return style;
    };

    _proto._deriveSurrogatePadding = function _deriveSurrogatePadding() {
      var indent = this._input_style.textIndent ? parseFloat(this._input_style.textIndent) : 0;

      if (this._input_style.padding && this._input_style.padding.length > 0) {
        var components = this._input_style.padding.trim().split(' ');

        if (components.length == 1) {
          var padding = parseFloat(components[0]);
          return [padding, padding, padding, padding + indent];
        } else if (components.length == 2) {
          var paddingV = parseFloat(components[0]);
          var paddingH = parseFloat(components[1]);
          return [paddingV, paddingH, paddingV, paddingH + indent];
        } else if (components.length == 4) {
          var _padding = components.map(function (component) {
            return parseFloat(component);
          });

          _padding[3] += indent;
          return _padding;
        }
      }

      return [0, 0, 0, indent];
    };

    _proto._deriveSurrogateText = function _deriveSurrogateText() {
      return this._dom_input.value.length === 0 ? this._placeholder : this._dom_input.value;
    };

    _proto._updateFontMetrics = function _updateFontMetrics() {
      var style = this._deriveSurrogateStyle();

      var font = style.toFontString();
      this._font_metrics = PIXI.TextMetrics.measureFont(font);
    } // CACHING OF INPUT BOX GRAPHICS
    ;

    _proto._buildBoxCache = function _buildBoxCache() {
      this._destroyBoxCache();

      var states = ['DEFAULT', 'FOCUSED', 'DISABLED'];

      var input_bounds = this._getDOMInputBounds();

      for (var i in states) {
        this._box_cache[states[i]] = this._box_generator(input_bounds.width, input_bounds.height, states[i]);
      }

      this._previous.input_bounds = input_bounds;
    };

    _proto._destroyBoxCache = function _destroyBoxCache() {
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
    ;

    _proto._hasFocus = function _hasFocus() {
      return document.activeElement === this._dom_input;
    };

    _proto._setDOMInputVisible = function _setDOMInputVisible(visible) {
      this._dom_input.style.display = visible ? 'block' : 'none';
    };

    _proto._getCanvasBounds = function _getCanvasBounds() {
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
    };

    _proto._getDOMInputBounds = function _getDOMInputBounds() {
      var remove_after = false;

      if (!this._dom_added) {
        document.body.appendChild(this._dom_input);
        remove_after = true;
      }

      var org_transform = this._dom_input.style.transform;
      var org_display = this._dom_input.style.display;
      this._dom_input.style.transform = '';
      this._dom_input.style.display = 'block';

      var bounds = this._dom_input.getBoundingClientRect();

      this._dom_input.style.transform = org_transform;
      this._dom_input.style.display = org_display;
      if (remove_after) document.body.removeChild(this._dom_input);
      return bounds;
    };

    _proto._getDOMRelativeWorldTransform = function _getDOMRelativeWorldTransform() {
      var canvas_bounds = this._last_renderer.view.getBoundingClientRect();

      var matrix = this.worldTransform.clone();
      matrix.scale(this._resolution, this._resolution);
      matrix.scale(canvas_bounds.width / this._last_renderer.width, canvas_bounds.height / this._last_renderer.height);
      return matrix;
    };

    _proto._pixiMatrixToCSS = function _pixiMatrixToCSS(m) {
      return 'matrix(' + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(',') + ')';
    };

    _proto._comparePixiMatrices = function _comparePixiMatrices(m1, m2) {
      if (!m1 || !m2) return false;
      return m1.a == m2.a && m1.b == m2.b && m1.c == m2.c && m1.d == m2.d && m1.tx == m2.tx && m1.ty == m2.ty;
    };

    _proto._compareClientRects = function _compareClientRects(r1, r2) {
      if (!r1 || !r2) return false;
      return r1.left == r2.left && r1.top == r2.top && r1.width == r2.width && r1.height == r2.height;
    };

    _createClass(TextInput, [{
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
    }, {
      key: "placeholder",
      get: function get() {
        return this._placeholder;
      },
      set: function set(text) {
        this._placeholder = text;

        if (this._substituted) {
          this._updateSurrogate();

          this._dom_input.placeholder = '';
        } else {
          this._dom_input.placeholder = text;
        }
      }
    }, {
      key: "disabled",
      get: function get() {
        return this._disabled;
      },
      set: function set(disabled) {
        this._disabled = disabled;
        this._dom_input.disabled = disabled;

        this._setState(disabled ? 'DISABLED' : 'DEFAULT');
      }
    }, {
      key: "maxLength",
      get: function get() {
        return this._max_length;
      },
      set: function set(length) {
        this._max_length = length;

        this._dom_input.setAttribute('maxlength', length);
      }
    }, {
      key: "restrict",
      get: function get() {
        return this._restrict_regex;
      },
      set: function set(regex) {
        if (_instanceof(regex, RegExp)) {
          regex = regex.toString().slice(1, -1);
          if (regex.charAt(0) !== '^') regex = '^' + regex;
          if (regex.charAt(regex.length - 1) !== '$') regex = regex + '$';
          regex = new RegExp(regex);
        } else {
          regex = new RegExp('^[' + regex + ']*$');
        }

        this._restrict_regex = regex;
      }
    }, {
      key: "text",
      get: function get() {
        return this._dom_input.value;
      },
      set: function set(text) {
        this._dom_input.value = text;
        if (this._substituted) this._updateSurrogate();
      }
    }, {
      key: "htmlInput",
      get: function get() {
        return this._dom_input;
      }
    }]);

    return TextInput;
  }(PIXI.Container);

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

    return function (w, h, state) {
      var style = styles[state.toLowerCase()];
      var box = new PIXI.Graphics();
      if (style.fill) box.beginFill(style.fill);
      if (style.stroke) box.lineStyle(style.stroke.width || 1, style.stroke.color || 0, style.stroke.alpha || 1);
      if (style.rounded) box.drawRoundedRect(0, 0, w, h, style.rounded);else box.drawRect(0, 0, w, h);
      box.endFill();
      box.closePath();
      return box;
    };
  }

  pkg.exportTo[0][pkg.exportTo[1]] = TextInput;
})((typeof PIXI === "undefined" ? "undefined" : _typeof(PIXI)) === 'object' ? {
  PIXI: PIXI,
  exportTo: [PIXI, 'TextInput']
} : (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' ? {
  PIXI: require('pixi.js'),
  exportTo: [module, 'exports']
} : console.warn('[PIXI.TextInput] could not attach to PIXI namespace. Make sure to include this plugin after pixi.js') || {});