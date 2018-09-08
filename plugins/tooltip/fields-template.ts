import ElementTooltip, {TooltipSettings} from './tooltip-base';

export const TOOLTIP_CLS = 'tau-chart__tooltip';

export default function FieldsTemplate(tooltip: ElementTooltip, settings: TooltipSettings) {

    return {

        render(args) {
            this.args = args;
            args = Object.assign({}, args, {
                fields: this.filterFields(args.fields)
            });
            return this.rootTemplate(args);
        },

        rootTemplate(args) {
            return [
                `<div class="${TOOLTIP_CLS}__buttons ${TOOLTIP_CLS}__clickable">`,
                this.buttonsTemplate(),
                `</div>`,
                `<div class="i-role-content ${TOOLTIP_CLS}__content">`,
                this.contentTemplate(args),
                '</div>'
            ].join('\n');
        },

        contentTemplate(args) {
            return this.fieldsTemplate(args);
        },

        filterFields(fields) {
            return fields;
        },

        getLabel(field) {
            return tooltip.getFieldLabel(field);
        },

        getFormatter(field) {
            return tooltip.getFieldFormat(field);
        },

        fieldsTemplate({data, fields}) {
            return fields
                .map((field) => {
                    return this.itemTemplate({data, field});
                })
                .join('\n');
        },

        itemTemplate({data, field}) {
            const label = this.getLabel(field);
            const value = this.getFormatter(field)(data[field]);
            return [
                `<div class="${TOOLTIP_CLS}__list__item">`,
                `  <div class="${TOOLTIP_CLS}__list__elem">${label}</div>`,
                `  <div class="${TOOLTIP_CLS}__list__elem">${value}</div>`,
                '</div>'
            ].join('\n');
        },

        buttonsTemplate() {
            return [
                this.buttonTemplate({
                    cls: 'i-role-exclude',
                    text: 'Exclude',
                    icon: () => '<span class="tau-icon-close-gray"></span>'
                })
            ].join('\n');
        },

        buttonTemplate({icon, text, cls}) {
            return [
                `<div class="${TOOLTIP_CLS}__button ${cls}">`,
                `  <div class="${TOOLTIP_CLS}__button__wrap">`,
                `    ${icon ? `${icon()} ` : ''}${text}`,
                '  </div>',
                '</div>'
            ].join('\n');
        },

        didMount() {
            const excludeBtn = tooltip.getDomNode().querySelector('.i-role-exclude');

            if (excludeBtn) {
                excludeBtn.addEventListener('click', () => {
                    tooltip.excludeHighlightedElement();
                    tooltip.setState({
                        highlight: null,
                        isStuck: false
                    });
                });
            }
        }
    };
}
