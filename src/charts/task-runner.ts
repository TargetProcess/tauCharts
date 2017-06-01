interface TaskRunnerCallbacks {
    timeout: (duration?: number, runner?: TaskRunner) => void;
    done: (result?: any, runner?: TaskRunner) => void;
    error: (error?: Error, runner?: TaskRunner) => void;
    progress: (progress?: number, runner?: TaskRunner) => void;
}

type Task = (x: any) => any;

export default class TaskRunner {

    private _running: boolean;
    private _queue: Task[];
    private _result: any;
    private _syncDuration: number;
    private _asyncDuration: number;
    private _syncInterval: number;
    private _requestedFrameId: number;
    private _tasksCount: number;
    private _finishedTasksCount: number;
    private _timeout: number;
    private _callbacks: TaskRunnerCallbacks;

    constructor({
        src = null,
        timeout = Number.MAX_SAFE_INTEGER,
        syncInterval = Number.MAX_SAFE_INTEGER,
        callbacks = {} as TaskRunnerCallbacks
    } = {}) {

        this.setTimeout(timeout);
        this.setSyncInterval(syncInterval);
        this.setCallbacks(callbacks);

        this._running = false;
        this._queue = [];
        this._result = src;
        this._syncDuration = 0;
        this._asyncDuration = 0;
        this._requestedFrameId = null;

        this._tasksCount = 0;
        this._finishedTasksCount = 0;
    }

    setTimeout(timeout: number) {
        TaskRunner.checkType(timeout, 'number', 'timeout');
        this._timeout = timeout;
    }

    setSyncInterval(syncInterval: number) {
        TaskRunner.checkType(syncInterval, 'number', 'syncInterval');
        this._syncInterval = syncInterval;
    }

    setCallbacks(callbacks: TaskRunnerCallbacks) {
        TaskRunner.checkType(callbacks, 'object', 'callbacks');
        this._callbacks = Object.assign(this._callbacks || {}, callbacks);
    }

    addTask(fn: Task) {
        this._queue.push(fn);
        this._tasksCount++;
        return this;
    }

    run() {
        if (this._running) {
            throw new Error('Task Runner is already running');
        }
        this._running = true;
        TaskRunner.runnersInProgress++;
        this._loopTasks();
    }

    isRunning() {
        return this._running;
    }

    _loopTasks() {

        var task: Task;
        var duration: number;
        var frameDuration = 0;
        var isTimeoutReached: boolean;
        var isFrameTimeoutReached: boolean;
        var syncInterval = (this._syncInterval / TaskRunner.runnersInProgress);
        while (
            this._running &&
            !(isTimeoutReached = (this._asyncDuration > this._timeout)) &&
            !(isFrameTimeoutReached = (frameDuration > syncInterval)) &&
            (task = this._queue.shift())
        ) {
            duration = this._runTask(task);
            if (duration === null) {
                return;
            }
            this._syncDuration += duration;
            this._asyncDuration += duration;
            frameDuration += duration;
        }

        if (
            isTimeoutReached &&
            (this._queue.length > 0)
        ) {
            this.stop();
            if (this._callbacks.timeout) {
                this._callbacks.timeout.call(null,
                    this._asyncDuration,
                    this);
            }
        }

        if (
            !isTimeoutReached &&
            isFrameTimeoutReached &&
            (this._queue.length > 0)
        ) {
            this._requestFrame();
        }

        if (this._queue.length === 0) {
            this.stop();
            if (this._callbacks.done) {
                this._callbacks.done.call(null,
                    this._result,
                    this);
            }
        }
    }

    _runTask(task: Task) {
        var start = performance.now();
        if (this._callbacks.error) {
            try {
                this._result = task.call(null,
                    this._result,
                    this);
            } catch (err) {
                this.stop();
                this._callbacks.error.call(null,
                    err,
                    this);
                return null;
            }
        } else {
            this._result = task.call(null,
                this._result,
                this);
        }
        var end = performance.now();
        var duration = (end - start);
        this._finishedTasksCount++;
        if (this._callbacks.progress) {
            this._callbacks.progress.call(null,
                (this._finishedTasksCount / this._tasksCount),
                this);
        }
        return duration;
    }

    _requestFrame() {
        var start = performance.now();
        this._requestedFrameId = requestAnimationFrame(() => {
            this._requestedFrameId = null;
            var end = performance.now();
            this._asyncDuration += (end - start);
            this._loopTasks();
        });
    }

    stop() {
        if (!this._running) {
            throw new Error('Task Runner is already stopped');
        }
        this._running = false;
        TaskRunner.runnersInProgress--;
        if (this._requestedFrameId) {
            cancelAnimationFrame(this._requestedFrameId);
            this._requestedFrameId = null;
        }
    }

    static checkType(x: any, t: string, name: string) {
        if (typeof x !== t) {
            throw new Error(`Task Runner "${name}" property is not "${t}"`);
        }
    }

    static runnersInProgress = 0;
}
