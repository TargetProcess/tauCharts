import Taucharts from 'taucharts';
import ElementTooltip, {TooltipSettings} from './tooltip/tooltip';

function Tooltip(settings: TooltipSettings) {
    return new ElementTooltip(settings);
}

Taucharts.api.plugins.add('tooltip', Tooltip);

export default Tooltip;
