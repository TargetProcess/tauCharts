import ElementTooltip, {TooltipSettings} from '../tooltip/tooltip';

export const TOOLTIP_CLS = 'graphical-report__tooltip';

export default function FieldsTemplate(tooltip: ElementTooltip, settings: TooltipSettings) {

    return {

        render(args) {
            args = Object.assign({}, args, {
                fields: this.filterFields(args.fields)
            });
            return this.rootTemplate(args);
        },

        rootTemplate(args) {
            return [
                `<div class="i-role-content ${TOOLTIP_CLS}__content">`,
                this.contentTemplate(args),
                '</div>',
                this.buttonsTemplate()
            ].join('\n');
        },

        contentTemplate(args) {
            return this.fieldsTemplate(args);
        },

        filterFields(fields) {
            return fields.filter((field) => {
                const tokens = field.split('.');
                const matchX = ((tokens.length === 2) && tooltip.skipInfo[tokens[0]]);
                return !matchX;
            });
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
                `<div class="i-role-exclude ${TOOLTIP_CLS}__exclude">`,
                `  <div class="${TOOLTIP_CLS}__exclude__wrap">`,
                '    <span class="tau-icon-close-gray"></span> Exclude',
                '  </div>',
                '</div>'
            ].join('\n');
        },

        didMount() {
            tooltip.getDomNode()
                .querySelector('.i-role-exclude')
                .addEventListener('click', () => {
                    tooltip.excludeHighlightedElement();
                    tooltip.setState({
                        highlight: null,
                        isStuck: false
                    });
                });
        }
    };
}
