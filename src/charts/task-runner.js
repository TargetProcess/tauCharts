export default class TaskRunner {
    constructor({
        timeout,
        syncInterval,
        callbacks
    }) {

        this.setTimeout(timeout);
        this.setSyncInterval(syncInterval);
        this.setCallbacks(callbacks);

        this._running = false;
        this._queue = [];
        this._result = null;
        this._syncDuration = 0;
        this._asyncDuration = 0;
        this._lastCall = null;
        this._requestedFrameId = null;

        this._tasksCount = 0;
        this._finishedTasksCount = 0;
    }

    setTimeout(timeout) {
        checkType(timeout, 'number');
        this._timeout = timeout;
    }

    setSyncInterval(syncInterval) {
        checkType(syncInterval, 'number');
        this._syncInterval = syncInterval;
    }

    setCallbacks(callbacks) {
        checkType(callbacks, 'object');
        this._callbacks = Object.assign({}, callbacks);
        checkType(callbacks.done, 'function');
        checkType(callbacks.timeout, 'function');
        checkType(callbacks.progress, 'function');
    }

    addTask(fn) {
        this._queue.push(fn);
        this._tasksCount++;
        return this;
    }

    insertTask(fn) {
        this._queue.unshift(fn);
        this._tasksCount++;
        return this;
    }

    run() {
        if (this._requestedFrameId) {
            throw new Error('Task Runner is waiting for the next frame');
        }
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

        var task;
        var duration;
        var frameDuration = 0;
        var isTimeoutReached;
        var isFrameTimeoutReached;
        var syncInterval = (this._syncInterval / TaskRunner.runnersInProgress);
        while (
            this._running &&
            !(isTimeoutReached = (this._asyncDuration > this._timeout)) &&
            !(isFrameTimeoutReached = (frameDuration > syncInterval)) &&
            (task = this._queue.shift())
        ) {
            duration = this._runTask(task);
            this._syncDuration += duration;
            this._asyncDuration += duration;
            frameDuration += duration;
        }

        if (
            isTimeoutReached &&
            (this._queue.length > 0)
        ) {
            this._callbacks.timeout.call(null,
                this._asyncDuration,
                this);
            this.stop();
        }

        if (
            !isTimeoutReached &&
            isFrameTimeoutReached &&
            (this._queue.length > 0)
        ) {
            this._requestFrame();
        }

        if (this._queue.length === 0) {
            this._callbacks.done.call(null,
                this._result,
                this);
            this.stop();
        }
    }

    _runTask(task) {
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
            }
        } else {
            this._result = task.call(null,
                this._result,
                this);
        }
        var end = performance.now();
        var duration = (end - start);
        this._finishedTasksCount++;
        this._callbacks.progress.call(null,
            (this._finishedTasksCount / this._tasksCount),
            this);
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
        cancelAnimationFrame(this._requestedFrameId);
        this._requestedFrameId = null;
    }
}

TaskRunner.runnersInProgress = 0;

function checkType(x, t) {
    if (typeof x !== t) {
        throw new Error('Unexpected Task Runner property type');
    }
}
