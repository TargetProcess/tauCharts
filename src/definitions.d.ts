export type global_Element = Element;
import {EventCallback, EventHandlerMap} from './event';
import {Plot} from './charts/tau.plot';

export interface GrammarModel {
    [m: string]: (row: any) => any;
}

export interface ScreenModel {
    [m: string]: (row: any) => any;
}

export interface DataFrame {
    part(): any[];
}

export type d3Selection = d3.Selection<global_Element, any, global_Element, any>;

export interface GrammarElement {
    init?(config: ElementConfig);
    config?: ElementConfig;
    screenModel?: ScreenModel;
    on?(name: string, callback: EventCallback, context?: any): EventHandlerMap;
    regScale?(paramId: string, scaleObj: ScaleObject): GrammarElement;
    getScale?(paramId: string): ScaleObject;
    fireNameSpaceEvent?(eventName: string, eventData: any);
    subscribe?(sel: GrammarElement, dataInterceptor: (x: any) => any, eventInterceptor: (x: Event) => Event);
    allocateRect?(): {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    defineGrammarModel?(fnCreateScale: any): any;
    getGrammarRules?(): any[];
    getAdjustScalesRules?(): any[];
    createScreenModel?(grammarModel: GrammarModel);
    getClosestElement?(x: number, y: number): any;
    addInteraction?();
    draw?();
    data?(): any[];
    node?(): GrammarElement;
}

export interface ElementConfig {
    namespace: string;
    uid: string;
    frames: DataFrame[];
    options: {
        container: d3Selection;
        slot: (uid: string) => d3Selection;
    };
    guide: ElementGuide;
    stack: boolean;
    transformRules?: ((prev?: GrammarModel) => GrammarModel)[];
    adjustRules?: ((prev?: GrammarModel, args?: any) => GrammarModel)[];
}

export interface ElementGuide {
    animationSpeed?: number;
    avoidScalesOverflow?: boolean;
    enableColorToBarPosition?: boolean;
    maxHighlightDistance?: number;
    size?: {
        minSize?: number;
        maxSize?: number;
    };
    label?: {
        position?: string[];
    };
}

export interface ScaleObject {

}

export interface ScaleConfig {
    dimType?: string;
    references?: WeakMap<any, any>;
    refCounter?: () => number;
    nice?: boolean;
    brewer?: string[];
}

export interface ScaleSettings {
    references?: WeakMap<any, any>;
    refCounter?: () => number;
    defaultNiceColor?: boolean;
    defaultColorBrewer?: string[];
    defaultClassBrewer?: string[];
    utcTime?: boolean;
}

export interface ChartConfig {
    type?: string;
    x?: string | string[];
    y?: string | string[];
    identity?: string;
    size?: string;
    color?: string;
    split?: string;
    label?: string;
    flip?: boolean;
    stack?: boolean;
    guide?: ChartGuide | ChartGuide[];
    dimensions?: ChartDimensionsMap;
    spec?: ChartSpec;
    settings?: ChartSettings;
    lineOrientation?: 'none' | 'horizontal' | 'vertical' | 'auto';
    data?: Object[];
    plugins?: PluginObject[];
}

export interface ChartScaleGuide {
    nice?: boolean;
    min?: number;
    max?: number;
    label?: string | {text: string; padding: number;};
    tickPeriod?: string;
    tickFormat?: string;
}

export interface ChartDimension {
    type: 'category' | 'measure' | 'order';
    scale?: 'ordinal' | 'period' | 'time' | 'linear' | 'logarithmic';
    order?: string[];
}

export interface ChartDimensionsMap {
    [field: string]: ChartDimension;
}

export interface ChartGuide {
    x?: ChartScaleGuide;
    y?: ChartScaleGuide;
    size?: ChartScaleGuide;
    padding?: {
        t: number;
        r: number;
        b: number;
        l: number;
    };
    color?: {
        brewer?: string[] | {[group: string]: string};
    };
    showAnchors?: 'always' | 'hover' | 'never';
    interpolate?: 'linear' | 'smooth' | 'smooth-keep-extremum' | 'step' | 'step-before' | 'step-after';
    split?: boolean;
    showGridLines?: 'x' | 'y' | 'xy';
}

export interface ChartSpec {
    dimensions?: ChartDimensionsMap;
    unit?: ChartSpec;
}

export interface Unit extends ChartConfig {
    unit?: Unit[];
}

export interface ChartSettings {
    animationSpeed?: number;
    renderingTimeout?: number;
    asyncRendering?: boolean;
    syncRenderingInterval?: number;
    syncPointerEvents?: boolean;
    handleRenderingErrors?: boolean;
    defaultColorBrewer?: string[];
    defaultClassBrewer?: string[];
    log?: (msg: string | string[], type?: 'ERROR' | 'WARNING' | 'INFO' | 'LOG') => void;
    facetLabelDelimiter?: string;
    excludeNull?: boolean;
    minChartWidth?: number;
    minChartHeight?: number;
    minFacetWidth?: number;
    minFacetHeight?: number;
    specEngine?: {
        name?: 'COMPACT' | 'AUTO';
        width?: number;
        height?: number;
    }[];
    fitModel?: 'none' | 'normal' | 'entire-view' | 'minimal' | 'fit-width' | 'fit-height';
    layoutEngine?: 'NONE' | 'EXTRACT';
    autoRatio?: boolean;
    defaultSourceMap?: string;
    getAxisTickLabelSize?: (text: string) => {width: number; height: number;};
    getScrollbarSize?: (container: Element) => {width: number; height: number;};
    avoidScrollAtRatio?: number;
    xAxisTickLabelLimit?: number;
    yAxisTickLabelLimit?: number;
    xTickWordWrapLinesLimit?: number;
    yTickWordWrapLinesLimit?: number;
    xTickWidth?: number;
    yTickWidth?: number;
    distToXAxisLabel?: number;
    distToYAxisLabel?: number;
    xAxisPadding?: number;
    yAxisPadding?: number;
    xFontLabelDescenderLineHeight?: number;
    xFontLabelHeight?: number;
    yFontLabelHeight?: number;
    xDensityPadding?: number;
    yDensityPadding?: number;
    'xDensityPadding:measure'?: number;
    'yDensityPadding:measure'?: number;
    utcTime?: boolean;
    defaultFormats?: {[name: string]: string};
}

export type PluginObject = Object & {
    init?: (chart: Plot) => void;
    destroy?: () => void;
    onRender?: () => void;
};
