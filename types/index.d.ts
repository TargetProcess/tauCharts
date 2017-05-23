interface ChartSpec {
    type: (
        'bar' |
        'horizontal-bar' |
        'horizontal-stacked-bar' |
        'line' |
        'map' |
        'parallel' |
        'scatterplot' |
        'stacked-area' |
        'stacked-bar'
    );
    x?: string | string[];
    y?: string | string[];
    size?: string;
    color?: string;
    id?: string;
    label?: string;
    split?: string;
    guide?: ChartGuide | ChartGuide[];
    settings?: ChartSettings;
    dimensions?: {
        [field: string]: {
            type: 'category' | 'measure' | 'order';
            scale?: 'ordinal' | 'period' | 'time' | 'linear' | 'logarithmic';
            order?: string[];
        }
    };
    plugins?: PluginObject[];
    data?: Object[];
}

interface ChartGuide {
    x?: {
        nice?: boolean;
        min?: number;
        max?: number;
        label?: string | { text: string; padding: number; };
        tickPeriod?: string;
        tickFormat?: string;
    };
    y?: {
        nice?: boolean;
        min?: number;
        max?: number;
        label?: string | { text: string; padding: number; };
        tickPeriod?: string;
        tickFormat?: string;
    };
    padding?: {
        t: number;
        r: number;
        b: number;
        l: number;
    };
    color?: {
        brewer?: string[] | { [group: string]: string };
    };
    showAnchors?: 'always' | 'hover' | 'never';
    interpolate?: 'linear' | 'smooth' | 'smooth-keep-extremum' | 'step' | 'step-before' | 'step-after';
    split?: boolean;
    showGridLines?: 'x' | 'y' | 'xy';
}

interface ChartSettings {
    animationSpeed?: number;
    renderingTimeout?: number;
    asyncRendering?: boolean;
    syncRenderingInterval?: number;
    syncPointerEvents?: boolean;
    handleRenderingErrors?: boolean;
    defaultColorBrewer?: string[];
    defaultClassBrewer?: string[];
    log?: (msg: string, type: 'ERROR' | 'WARNING' | 'INFO' | 'LOG') => void;
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
    getAxisTickLabelSize?: (text: string) => { width: number; height: number; };
    getScrollbarSize?: (container: Element) => { width: number; height: number; };
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
    defaultFormats?: { [name: string]: string };
}

type EventCallback = (sender: Emitter, data: any) => void;

interface EventHandlerMap {
    [event: string]: EventCallback;
}

interface Emitter {
    addHandler(callbacks: EventHandlerMap, context?: any): void;
    removeHandler(callbacks: EventHandlerMap, context?: any): void;
    on(name: string, callback: EventCallback, context?: any): EventHandlerMap;
    fire(name: string, data: any): void;
    destroy(): void;
}

interface PlotSize {
    width?: number;
    height?: number
}

interface PlotLayout {
    layout: HTMLDivElement;
    header: HTMLDivElement;
    content: HTMLDivElement;
    contentContainer: HTMLDivElement;
    leftSidebar: HTMLDivElement;
    rightSidebar: HTMLDivElement;
    rightSidebarContainer: HTMLDivElement;
    footer: HTMLDivElement;
}

declare class Plot implements Emitter {
    addHandler(callbacks: EventHandlerMap, context?: any): void;
    removeHandler(callbacks: EventHandlerMap, context?: any): void;
    on(name: string, callback: EventCallback, context?: any): EventHandlerMap;
    fire(name: string, data: any): void;
    destroy(): void;

    constructor(config: ChartSpec);

    renderTo(targetOrSelector: Element | string, size?: PlotSize): void;
    getSVG(): SVGSVGElement;
    addFilter(filter: any): number;
    removeFilter(id: number): this;
    refresh(): void;
    resize(size?: PlotSize): void;
    getLayout(): PlotLayout;
}

declare class Chart extends Plot {
    constructor(config: ChartSpec);
    static winAware: Chart[];
}

type PluginObject = Object & {
    init?: (chart: Plot) => void;
    destroy?: () => void;
    onRender?: () => void;
};

declare var api: {

    utils: {
        clone<T>(obj: T): T;
        isDate(obj: any): boolean;
        isObject(obj: any): boolean;
        isChartElement(element: any): boolean;
        generateHash(str: string): string;
        toRadian(degree: number): number;
        normalizeAngle(angle: number): number;
        range(start: number, end: number): [number, number];
        flatten(array: any[]): any[];
        unique<T>(array: T[], func?: (item: T) => string): T[];
        groupBy<T>(array: T[], func?: (item: T) => string): { [key: string]: T };
    };
    tickFormat: {
        get(name: string): (x: any) => string;
        add(name: string, formatter: (x: any) => string): void;
    };
    tickPeriod: {
        get(name: string, settings?: { utc?: boolean }): { cast: (d: Date) => Date; next: (d: Date) => Date; };
        add(name: string, period: { cast: (d: Date) => Date; next: (d: Date) => Date; }, settings?: { utc?: boolean }): void;
    };
    globalSettings: ChartSettings;

    plugins: {

        add(name: string, plugin: (settings?: any) => PluginObject): void;

        get(name: string): (settings?: any) => PluginObject;

        get(name: 'annotations'): (settings: {
            items: {
                dim: string;
                val: any | [any, any];
                text: string;
                color?: string;
            }[];
        }) => PluginObject;

        get(name: 'bar-as-span'): (settings: {
            x0?: string;
            y0?: string;
            collapse?: boolean;
        }) => PluginObject;

        get(name: 'box-whiskers'): (settings?: {
            mode: 'show-scatter' | 'hide-scatter' | 'outliers-only';
        }) => PluginObject;

        get(name: 'crosshair'): (settings?: {
            xAxis?: boolean;
            yAxis?: boolean;
            formatters?: {
                [field: string]: (((x: any) => string) | { label: string; format: (x: any) => string; })
            },
            labelBoxHPadding?: number;
            labelBoxVPadding?: number;
            labelBoxCornerRadius?: number;
            axisHPadding?: number;
            axisVPadding?: number;
        }) => PluginObject;

        get(name: 'exportTo'): (settings?: {
            fontSize?: number;
            paddingTop?: number;
            backgroundColor?: string;
            csvSeparator?: string;
            exportFields?: any[];
            appendFields?: any[];
            excludeFields?: any[];
            visible?: boolean;
        }) => PluginObject;

        get(name: 'floating-axes'): (settings?: {
            detectBackground?: boolean;
            bgcolor?: string;
        }) => PluginObject;

        get(name: 'layers'): (settings: {
            title?: string;
            label?: string;
            showPanel?: boolean;
            showLayers?: boolean;
            mode?: 'dock' | 'merge';
            axisWidth?: number;
            layers?: ChartSpec[];
            brewer?: { [key: string]: string };
        }) => PluginObject;

        get(name: 'legend'): (settings?: {
            position?: 'left' | 'right' | 'top' | 'bottom';
        }) => PluginObject;

        get(name: 'quick-filter'): (settings?: {
            fields?: string[];
            applyImmediately?: boolean;
        }) => PluginObject;

        get(name: 'tooltip'): (settings?: {
            fields?: string[];
            formatters?: {
                [field: string]: (((x: any) => string) | { label: string; format: (x: any) => string; })
            }
        }) => PluginObject;

        get(name: 'trendline'): (settings?: {
            type?: string;
            hideError?: boolean;
            showPanel?: boolean;
            showTrend?: boolean;
            models?: 'linear' | 'exponential' | 'logarithmic';
        }) => PluginObject;

    };
};

declare var version: string;

export default {
    Plot,
    Chart,
    api,
    version,
};

export {
    Plot,
    Chart,
    api,
    version
};
