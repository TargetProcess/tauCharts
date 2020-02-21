import Taucharts from 'taucharts';
import Tooltip, {TooltipSettings} from './tooltip/tooltip-base';

function TooltipPlugin(settings: TooltipSettings) {
    return new Tooltip(settings);
}

Taucharts.api.plugins.add('tooltip', TooltipPlugin);

export default TooltipPlugin;
