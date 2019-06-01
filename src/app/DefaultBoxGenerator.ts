export default function DefaultBoxGenerator(styles) {
    styles = styles || { fill: 0xcccccc };

    if (styles.default) {
        styles.focused = styles.focused || styles.default;
        styles.disabled = styles.disabled || styles.default;
    } else {
        let temp_styles = styles;
        styles = {};
        styles.default = styles.focused = styles.disabled = temp_styles;
    }

    return function(w, h, state) {
        let style = styles[state.toLowerCase()];
        let box = new PIXI.Graphics();

        if (style.fill) box.beginFill(style.fill);

        if (style.stroke) box.lineStyle(style.stroke.width || 1, style.stroke.color || 0, style.stroke.alpha || 1);

        if (style.rounded) box.drawRoundedRect(0, 0, w, h, style.rounded);
        else box.drawRect(0, 0, w, h);

        box.endFill();
        box.closePath();

        return box;
    };
}
