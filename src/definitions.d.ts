import {EventCallback, EventHandlerMap} from './event';
import {Plot} from './charts/tau.plot';
import {DataFrame} from './data-frame';
import {PeriodGenerator} from './unit-domain-period-generator';
import {Selection} from 'd3-selection';

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
    [m: string]: any;

    flip?: boolean;
    id?(row): any;
    x?(row): number;
    y?(row): number;
    x0?(row): number;
    y0?(row): number;
    size?(row): number;
    group?(row): string;
    order?(row): number;
    label?(row): string;
    color?(row): string;
    class?(row): string;
    model?: GrammarModel;
    toFibers?(): any[];
}

export interface DataKey {
    [key: string]: string;
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
    '/'?: DataSource;
    '?'?: DataSource;
}

export interface DataFrameObject {
    key?: DataKey;
    pipe?: DataFilter[];
    source: string;
    units?: Unit[];
}

export interface DataTransformations {
    [trans: string]: (data: any[], tuple: any) => any[];
}

export type GrammarRule = (prev: GrammarModel, args?: any) => GrammarModel;

export interface GrammarElement {
    init?(config: Unit);
    config?: Unit;
    screenModel?: ScreenModel;
    on?(name: string, callback: EventCallback, context?: any): EventHandlerMap;
    fire?(name: string, data?: any);
    destroy?();
    regScale?(paramId: string, scaleObj: ScaleFunction): GrammarElement;
    getScale?(paramId: string): ScaleFunction;
    fireNameSpaceEvent?(eventName: string, eventData: any);
    subscribe?(
        sel: GrammarElement | d3Selection,
        dataInterceptor?: (x: any) => any, eventInterceptor?: (x: Event) => Event
    );
    allocateRect?(key?: DataKey): ElementOptions;
    defineGrammarModel?(fnCreateScale: ScaleFactoryMethod): GrammarModel;
    getGrammarRules?(): GrammarRule[];
    getAdjustScalesRules?(): GrammarRule[];
    createScreenModel?(grammarModel: GrammarModel): ScreenModel;
    getClosestElement?(x: number, y: number): ClosestElementInfo;
    addInteraction?();
    draw?();
    data?(): any[];
    node?(): GrammarElement;
    parentUnit?: GrammarElement;
}

export interface ClosestElementInfo {
    data;
    node: Element;
    x: number;
    y: number;
    distance: number;
    secondaryDistance: number;
}

export interface ElementOptions {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    containerWidth?: number;
    containerHeight?: number;
    container?: d3Selection;
    slot?: (uid?: string) => d3Selection;
    frameId?: string;
}

type Brewer = string[] | {[group: string]: string};

export interface UnitGuide {
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
    showGridLines?: 'x' | 'y' | 'xy' | '';
    utcTime?: boolean;
    paddingNoTicks?: {
        b: number;
        l: number;
    };
    autoLayout?: string;
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
    range?: (...args: any[]) => any[];
    ticks?: (...args: any[]) => any[];
    tickFormat?(...args: any[]): (x) => string;
    copy?: () => ScaleFunction;
    discrete?: boolean;
    toColor?: (color: string) => string;
    toClass?: (color: string) => string;
    bandwidth?(): number;
    round?(): number;
}

type ScaleFactoryMethod = (type: string, alias: string, dynamicProps) => ScaleFunction;

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
    fixedBorders?: number[];
    minSize?: number;
    maxSize?: number;
    min?: any;
    max?: any;
    ratio?: RatioArg;
    niceInterval?: string;
    utcTime?: boolean;
    func?: string;
    period?: string;
    georole?: string;
}

export interface Unit {
    color?: string;
    expression?: Expression;
    flip?: boolean;
    frames?: DataFrame[];
    guide?: UnitGuide;
    identity?: string;
    label?: string;
    namespace?: string;
    options?: ElementOptions;
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
    transformRules?: GrammarRule[];
    adjustRules?: GrammarRule[];
    transformModel?: GrammarRule[];
    adjustScales?: GrammarRule[];
}

export interface Expression {
    inherit?: boolean;
    operator?: string | false;
    params?: string[];
    source?: string;
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
    guide?: UnitGuide | UnitGuide[];
    dimensions?: ChartDimensionsMap;
    spec?: ChartSpec;
    settings?: ChartSettings;
    lineOrientation?: 'none' | 'horizontal' | 'vertical' | 'auto';
    data?: Object[];
    plugins?: PluginObject[];
    emptyContainer?: string;
    autoResize?: boolean;
}

export interface ScaleGuide {
    nice?: boolean;
    min?: number;
    max?: number;
    minSize?: number;
    maxSize?: number;
    label?: AxisLabelGuide;
    tickPeriod?: string;
    timeInterval?: string;
    tickFormat?: string;
    brewer?: Brewer;
    func?: string;
    autoScale?: boolean;
    niceInterval?: string;
    fitToFrameByDims?: string[];
    ratio?: RatioArg;
    tickLabel?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    fontColor?: string;
    hideEqualLabels?: boolean;
    position?: string[];
    tickFormatNullAlias?: string;
    padding?: number;
    paddingNoTicks?: number;
    hide?: boolean;
    hideTicks?: boolean;
    rotate?: number;
    textAnchor?: string;
    $maxTickTextW?: number;
    $maxTickTextH?: number;
    density?: number;
    cssClass?: string;
    scaleOrient?: string;
    tickFormatWordWrap?: boolean;
    tickFormatWordWrapLines?: number;
    tickFormatWordWrapLimit?: number;
    tickFontHeight?: number;
    avoidCollisions?: boolean;
    fillGaps?: boolean;
}

export interface AxisLabelGuide {
    text: string;
    padding: number;
    hide?: boolean;
    paddingNoTicks?: number;
    cssClass?: string;
    dock?: string;
    textAnchor?: string;
    size?: number;
    rotate?: number;
    _original_text?: string;
}

export interface ScaleSettings {
    references?: WeakMap<any, any>;
    refCounter?: () => number;
    defaultNiceColor?: boolean;
    defaultColorBrewer?: string[];
    defaultClassBrewer?: string[];
    utcTime?: boolean;
}

export interface Dimension {
    type: 'category' | 'measure' | 'order';
    scale?: 'ordinal' | 'period' | 'time' | 'linear' | 'logarithmic';
    order?: any[];
    value?: any;
    hasNull?: boolean;
}

export interface ChartDimensionsMap {
    [field: string]: Dimension;
}

export interface ChartSpec {
    dimensions?: ChartDimensionsMap;
    unit?: Unit;
}

export interface Size {
    width?: number;
    height?: number;
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
    log?: (msg: string | string[], type?: 'ERROR' | 'WARN' | 'INFO' | 'LOG') => void;
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
    size?: Size;
    experimentalShouldAnimate?: (spec: GPLSpec) => boolean;
}

export interface GPLSpec {
    scales: {[scale: string]: ScaleConfig};
    sources: DataSources;
    settings: ChartSettings;
    unit?: Unit;
    transformations?: DataTransformations;
}

export interface SpecTransformer {
    transform(chart?: Plot): GPLSpec;
    isApplicable: boolean;
}

export interface SpecTransformConstructor {
    new(spec: GPLSpec): SpecTransformer;
}

export type PluginObject = Object & {
    init?(chart: Plot): void;
    destroy?(): void;
    onRender?(chart: Plot, svg: SVGSVGElement): void;
    onBeforeRender?(chart: Plot, svg: SVGSVGElement): void;
    onSpecReady?(chart: Plot, spec: GPLSpec): void;
    onUnitsStructureExpanded?(chart: Plot, spec: GPLSpec): void;
    onRenderingTimeout?(chart: Plot, timeout: number): void;
    onRenderingError?(chart: Plot, error: Error): void;
    onUnitDraw?(chart: Plot, unit: GrammarElement): void;
};

export interface PointerEventArgs {
    element: GrammarElement;
    data;
    event: MouseEvent;
}

export type Plot = Plot;
