import Taucharts from 'taucharts';
import Tooltip, {TooltipSettings} from './tooltip/tooltip';

function TooltipPlugin(settings: TooltipSettings) {
    return new Tooltip(settings);
}

Taucharts.api.plugins.add('tooltip', TooltipPlugin);

export default TooltipPlugin;
