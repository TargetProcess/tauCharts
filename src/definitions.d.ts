import {EventCallback, EventHandlerMap} from './event';
import {Plot} from './charts/tau.plot';
import {DataFrame} from './data-frame';
import {Selection} from 'd3';

export type global_Element = Element;
export type d3Selection = Selection<global_Element, any, global_Element, any>;

export interface GrammarModel {
    [m: string]: any;

    color?(row): string;
    data?(): any[];
    flip?: boolean;
    group?(row): string;
    id?(row): any;
    label?(row): string;
    order?(row): number;
    scaleColor?: ScaleFunction;
    scaleIdentity?: ScaleFunction;
    scaleLabel?: ScaleFunction;
    scaleSize?: ScaleFunction;
    scaleSplit?: ScaleFunction;
    scaleX?: ScaleFunction;
    scaleY?: ScaleFunction;
    size?(row): number;
    xi?(row): number;
    y0?(row): number;
    yi?(row): number;
}

export interface ScreenModel {
    [m: string]: (row: any) => any;
}

export interface DataKey {
    name: string;
}

export interface DataFilter {
    type: string;
    args: {[key: string]: string};
}

export interface DataSource {
    data: any[];
    dims: {
        [dim: string]: Dimension;
    };
}

export interface DataSources {
    '/': DataSource;
    '?': DataSource;
}

export interface DataTransformations {
    [trans: string]: (data: any[], tuple: any) => any[];
}

export interface GrammarElement {
    init?(config: ElementConfig);
    config?: ElementConfig;
    screenModel?: ScreenModel;
    on?(name: string, callback: EventCallback, context?: any): EventHandlerMap;
    regScale?(paramId: string, scaleObj: ScaleFunction): GrammarElement;
    getScale?(paramId: string): ScaleFunction;
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
    parentUnit?: Unit;
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

type Brewer = string[] | {[group: string]: string};

export interface ElementGuide {
    animationSpeed?: number;
    avoidScalesOverflow?: boolean;
    enableColorToBarPosition?: boolean;
    maxHighlightDistance?: number;
    x?: ScaleGuide;
    y?: ScaleGuide;
    size?: ScaleGuide;
    label?: ScaleGuide;
    padding?: {
        t: number;
        r: number;
        b: number;
        l: number;
    };
    color?: ScaleGuide;
    showAnchors?: 'always' | 'hover' | 'never';
    interpolate?: 'linear' | 'smooth' | 'smooth-keep-extremum' | 'step' | 'step-before' | 'step-after';
    split?: ScaleGuide;
    showGridLines?: 'x' | 'y' | 'xy';
}

export interface ScaleFields {
    dim: string;
    scaleDim: string;
    scaleType: string;
    discrete?: boolean;
    source: string;
    domain: () => any[];
    isInteger: boolean;
    originalSeries: () => any[];
    isContains: (x) => boolean;
    isEmptyScale: () => boolean;
    fixup: (fn: (config: ScaleConfig) => ScaleConfig) => void;
    commit: () => void;
    period?: string;
}

export interface ScaleFunction extends ScaleFields {
    (x): any;
    getHash: () => string;
    value: (x, row?) => any;
    stepSize?: (x?) => number;
    ticks?: () => any[];
    copy?: () => ScaleFunction;
    discrete?: boolean;
}

type RatioArg = {[key: string]: number} | ((key: any, maxSize: number, keys: any[]) => number);

export interface ScaleConfig {
    dim?: string;
    type?: string;
    source?: string;
    dimType?: string;
    references?: WeakMap<any, any>;
    refCounter?: () => number;
    nice?: boolean;
    brewer?: Brewer;
    fitToFrameByDims?: string[];
    order?: any[];
    autoScale?: boolean;
    series?: any[];
    __fixup__?: any;
    fixed?: boolean;
    minSize?: number;
    maxSize?: number;
    min?: any;
    max?: any;
    ratio?: RatioArg;
    niceInterval?: string;
    utcTime?: boolean;
    period?: string;
    georole?: string;
}

export interface Unit {
    color?: string;
    expression?: Expression;
    flip?: boolean;
    frames?: DataFrame[];
    guide?: ElementGuide;
    identity?: string;
    label?: string;
    namespace?: string;
    options?: {

    };
    size?: string;
    split?: string;
    stack?: boolean;
    transformation?: {
        type: string;
        args: {
            type: string;
        } & {
            [dim: string]: ScaleConfig;
        }
    }[];
    type?: string;
    uid?: string;
    x?: string;
    y?: string;
    unit?: Unit[];
    units?: Unit[];
}

export interface Expression {
    inherit?: boolean;
    operator?: string;
    params?: string[];
    source?: string;
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
    guide?: ElementGuide | ElementGuide[];
    dimensions?: ChartDimensionsMap;
    spec?: ChartSpec;
    settings?: ChartSettings;
    lineOrientation?: 'none' | 'horizontal' | 'vertical' | 'auto';
    data?: Object[];
    plugins?: PluginObject[];
}

export interface ScaleGuide {
    nice?: boolean;
    min?: number;
    max?: number;
    minSize?: number;
    maxSize?: number;
    label?: string | {text: string; padding: number;};
    tickPeriod?: string;
    tickFormat?: string;
    fontSize?: string;
    brewer?: Brewer;
    func?: string;
    autoScale?: boolean;
    niceInterval?: string;
    fitToFrameByDims?: string[];
    ratio?: RatioArg;
    tickLabel?: string;
}

export interface Dimension {
    type: 'category' | 'measure' | 'order';
    scale?: 'ordinal' | 'period' | 'time' | 'linear' | 'logarithmic';
    order?: any[];
    value?: any;
}

export interface ChartDimensionsMap {
    [field: string]: Dimension;
}

export interface ChartSpec {
    dimensions?: ChartDimensionsMap;
    unit?: Unit;
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

export interface GPLSpec {
    scales: {[scale: string]: GPLSpecScale};
    sources: DataSources;
    settings: ChartSettings;
    unit?: Unit;
    transformations?: DataTransformations;
}

export interface GPLSpecScale {
    type: string;
    source: string;
    dim?: string;
    brewer?: Brewer;
    order?: any[];
    min?: any;
    max?: any;
    nice?: boolean;
    func?: string;
    minSize?: number;
    maxSize?: number;
    autoScale?: boolean;
    niceInterval?: string;
    period?: string;
    fitToFrameByDims?: string[];
    ratio?: RatioArg;
}

export type PluginObject = Object & {
    init?: (chart: Plot) => void;
    destroy?: () => void;
    onRender?: () => void;
};
