import getFieldsTemplate, {TOOLTIP_CLS} from '../tooltip/fields-template';
import {GrammarElement} from '../../src/definitions';
import ElementTooltip, {TooltipSettings} from '../tooltip/tooltip-base';

export const DIFF_TOOLTIP_CLS = 'diff-tooltip';
export const ROW_CLS = `${DIFF_TOOLTIP_CLS}__item`;
export const HEADER_CLS = `${DIFF_TOOLTIP_CLS}__header`;

export default function DiffTemplate(tooltip: ElementTooltip, settings: TooltipSettings) {

    const base = getFieldsTemplate(tooltip, settings);

    return Object.assign({}, base, {

        hasColor() {
            const {colorField} = this.args;
            return (colorField != null);
        },

        contentTemplate(args) {
            return [
                this.fieldsTemplate(args),
                this.tableTemplate(args)
            ].join('\n');
        },

        filterFields(fields) {
            const unit = tooltip.state.highlight.unit as GrammarElement;
            const screenModel = unit.screenModel;
            const {scaleColor, scaleX, scaleY} = screenModel.model;

            const filtered = fields
                .filter((field) => {
                    return (
                        (field !== scaleColor.dim) &&
                        (field !== scaleX.dim) &&
                        (field !== scaleY.dim)
                    );
                });

            const addX = () => filtered.push(scaleX.dim);
            const addY = () => filtered.push(scaleY.dim);
            const addColor = () => scaleColor.dim && filtered.push(scaleColor.dim);

            if (this.shouldShowColorTable()) {
                addX();
            } else {
                addX();
                addColor();
                addY();
            }

            return base.filterFields.call(this, filtered);
        },

        itemTemplate({data, field}) {
            const label = this.getLabel(field);
            const value = this.getFormatter(field)(data[field]);
            const prev = this.args.prev;
            const valueField = this.args.valueField;
            const hasDiff = this.shouldShowDiff(field);

            const valueElement = [
                `<span class="${ROW_CLS}__value">`,
                `${value}`,
                (hasDiff ? ` ${this.fieldUpdownTemplate(this.getDiff({data, prev, field}))}` : ''),
                '</span>'
            ].join('');

            return [
                `<div class="${TOOLTIP_CLS}__list__item">`,
                `  <div class="${TOOLTIP_CLS}__list__elem">${label}</div>`,
                `  ${valueElement}`,
                '</div>'
            ].join('\n');
        },

        shouldShowDiff(field) {
            const valueField = this.args.valueField;
            return (field === valueField);
        },

        getDiff({data, prev, field}) {
            const format = this.getFormatter(field);

            const v = (data ? data[field] : 0);
            const p = (prev ? prev[field] : 0);
            const dv = (v - p);

            const diff = format(dv);
            const sign = Math.sign(dv);

            return {diff, sign};
        },

        fieldUpdownTemplate({diff, sign}) {
            const updownCls = `${DIFF_TOOLTIP_CLS}__field__updown`;
            const updownSignCls = `${updownCls}_${sign > 0 ? 'positive' : 'negative'}`;
            const updownSymbol = (sign > 0 ? '&#x25B2;' : sign < 0 ? '&#x25BC;' : '');
            const diffVal = (sign === 0 ? '' : diff);

            return [
                `<span class="${updownCls} ${updownSignCls}">`,
                `${updownSymbol}${diffVal}`,
                '</span>'
            ].join('');
        },

        shouldShowColorTable() {
            const groups = this.args.groups;
            return (this.hasColor() && groups.length > 1);
        },

        tableTemplate(args) {
            if (!this.shouldShowColorTable()) {
                return '';
            }
            return [
                `<div class="${DIFF_TOOLTIP_CLS}__table">`,
                this.tableHeaderTemplate(args),
                this.tableBodyTemplate(args),
                '</div>'
            ].join('\n');
        },

        tableHeaderTemplate({colorField, valueField}) {
            const groupLabel = this.getLabel(colorField);
            const valueLabel = this.getLabel(valueField);
            return [
                `<div class="${HEADER_CLS}">`,
                `  <span class="${HEADER_CLS}__text">${groupLabel}</span>`,
                `  <span class="${HEADER_CLS}__value">${valueLabel}</span>`,
                `  <span class="${HEADER_CLS}__updown">&#x25BC;&#x25B2;</span>`,
                '</div>'
            ].join('\n');
        },

        tableBodyTemplate({data, groups, valueField, colorField}) {
            const highlighted = data;

            const values = groups.map(({data}) => data ? data[valueField] : 0);
            const min = Math.min(...values);
            const max = Math.max(...values);

            return [
                `<div class="${DIFF_TOOLTIP_CLS}__body">`,
                `<div class="${DIFF_TOOLTIP_CLS}__body__content">`,
                groups.map(({data, prev}) => {
                    return this.tableRowTemplate({data, prev, highlighted, valueField, colorField, min, max});
                }).join('\n'),
                `</div>`,
                `</div>`
            ].join('\n');
        },

        tableRowTemplate({data, prev, highlighted, valueField, colorField, min, max}) {

            const v = (data ? data[valueField] : 0);
            const name = this.getFormatter(colorField)((data || prev)[colorField]);
            const format = this.getFormatter(valueField);
            const value = format(v);
            const isHighlighted = (data === highlighted);

            const {diff, sign} = this.getDiff({data, prev, field: valueField});
            const {color, colorCls} = this.getColor(data || prev);

            return [
                `<div class="${ROW_CLS}${isHighlighted ? ` ${ROW_CLS}_highlighted` : ''}">`,
                `  ${this.valueBarTemplate({min, max, v, color, colorCls})}`,
                `  <span class="${ROW_CLS}__text">${name}</span>`,
                `  <span class="${ROW_CLS}__value">${value}</span>`,
                `  ${this.updownTemplate({diff, sign})}`,
                '</div>'
            ].join('\n');
        },

        valueBarTemplate({min, max, v, color, colorCls}) {
            min = Math.min(min, 0);
            max = Math.max(0, max);
            const range = (max - min);
            const left = (range === 0 ? 0 : ((v < 0 ? v - min : -min) / range));
            const width = (range === 0 ? 0 : ((v < 0 ? -v : v) / range));
            return [
                '<span',
                `    class="${ROW_CLS}__bg${colorCls ? ` ${colorCls}` : ''}"`,
                `    style="left: ${left * 100}%; width: ${width * 100}%; background-color: ${color};"`,
                `    ></span>`,
            ].join('\n');
        },

        getColor(data) {
            const unit = tooltip.state.highlight.unit as GrammarElement;
            const screenModel = unit.screenModel;
            return {
                color: screenModel.color(data),
                colorCls: screenModel.class(data)
            };
        },

        updownTemplate({diff, sign}) {
            const updownCls = `${ROW_CLS}__updown`;
            const updownSignCls = `${updownCls}_${sign > 0 ? 'positive' : 'negative'}`;
            const updownSymbol = (sign > 0 ? '&#x25B2;' : sign < 0 ? '&#x25BC;' : '');
            const diffVal = (sign === 0 ? '' : diff);

            return [
                `<span class="${updownCls} ${updownSignCls}">`,
                `${updownSymbol}${diffVal}`,
                '</span>'
            ].join('');
        },

        didMount() {
            base.didMount.call(this);

            this._scrollToHighlighted();
            this._reserveSpaceForUpdown();
        },

        _scrollToHighlighted() {
            const node = tooltip.getDomNode() as HTMLElement;
            const body = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body`) as HTMLElement;
            const content = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body__content`) as HTMLElement;
            const highlighted = node.querySelector(`.${ROW_CLS}_highlighted`) as HTMLElement;

            if (!(body && content && highlighted)) {
                return;
            }

            const b = body.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            const h = highlighted.getBoundingClientRect();

            var shift = 0;

            if (h.bottom > b.bottom) {
                const dy = ((h.bottom - b.bottom) + h.height);
                const limitDy = (c.bottom - b.bottom);
                shift = -Math.min(dy, limitDy);
                content.style.transform = `translateY(${shift}px)`;
            }

            if (c.top + shift < b.top) {
                body.classList.add(`${DIFF_TOOLTIP_CLS}__body_overflow-top`);
            }
            if (c.bottom + shift > b.bottom) {
                body.classList.add(`${DIFF_TOOLTIP_CLS}__body_overflow-bottom`);
            }
        },

        _reserveSpaceForUpdown() {
            const node = tooltip.getDomNode() as HTMLElement;
            const body = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body`) as HTMLElement;
            const header = node.querySelector(`.${HEADER_CLS}`) as HTMLElement;

            if (!(body && header)) {
                return;
            }

            // Todo: Use CSS table layout, no need in JS hack
            const updownSelector = `.${ROW_CLS}__updown:not(:empty)`;
            const updowns = Array.from(node.querySelectorAll(updownSelector));
            const widths = updowns.map((el) => el.scrollWidth);
            const maxWidth = Math.max(...widths);
            const tooltipPad = 15;
            const pad = Math.max(0, Math.ceil(maxWidth - tooltipPad));

            body.style.paddingRight = `${pad}px`;
            header.style.paddingRight = `${pad}px`;
        }
    });
}
