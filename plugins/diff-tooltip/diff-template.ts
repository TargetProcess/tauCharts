import getFieldsTemplate, {TOOLTIP_CLS} from '../tooltip/fields-template';
import {GrammarElement} from '../../src/definitions';
import ElementTooltip, {TooltipSettings} from '../tooltip/tooltip';

export const DIFF_TOOLTIP_CLS = 'diff-tooltip';
export const ROW_CLS = `${DIFF_TOOLTIP_CLS}__item`;
export const HEADER_CLS = `${DIFF_TOOLTIP_CLS}__header`;

export default function DiffTemplate(tooltip: ElementTooltip, settings: TooltipSettings) {

    const base = getFieldsTemplate(tooltip, settings);

    return Object.assign({}, base, {

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
                })
                .concat(scaleX.dim); // Place X field at end

            return base.filterFields.call(this, filtered);
        },

        tableTemplate(args) {
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

            const values = groups.map(({data}) => data[valueField]);
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

            const name = this.getLabel(data[colorField]);
            const format = this.getFormatter(valueField);
            const value = format(data[valueField]);
            const isHighlighted = (data === highlighted);

            const v = data[valueField];
            const p = (prev ? prev[valueField] : 0);
            const dv = (v - p);

            const diff = format(dv);
            const sign = Math.sign(dv);

            const {color, colorCls} = this.getColor(data);

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
            const left = ((v < 0 ? v - min : -min) / range);
            const width = ((v < 0 ? -v : v) / range);
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

            const node = tooltip.getDomNode() as HTMLElement;
            const body = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body`) as HTMLElement;
            const content = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body__content`) as HTMLElement;
            const highlighted = node.querySelector(`.${ROW_CLS}_highlighted`) as HTMLElement;

            const b = body.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            const h = highlighted.getBoundingClientRect();

            if (c.bottom > b.bottom) {
                body.classList.add(`${DIFF_TOOLTIP_CLS}__body_overflow`);
            }

            if (h.bottom > b.bottom) {
                // Scroll to highlighted item
                const dy = ((h.bottom - b.bottom) + h.height);
                const limitDy = (c.bottom - b.bottom);
                content.style.transform = `translateY(${-Math.min(dy, limitDy)}px)`;
            }
        }
    });
}
