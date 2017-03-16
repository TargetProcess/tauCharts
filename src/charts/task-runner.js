export default class TaskRunner {
    constructor({
        timeout,
        syncInterval,
        callbacks
    }) {

        this.timeout = timeout;
        this.syncInterval = syncInterval;
        this.callbacks = callbacks;

        this.stopped = true;
        this._queue = [];
        this._result = null;
        this._syncDuration = 0;
        this._asyncDuration = 0;
        this._lastCall = null;
        this._requestedFrameId = null;

        this._tasksCount = 0;
        this._finishedTasksCount = 0;
    }

    addTask(fn) {
        this._queue.push(fn);
        this._tasksCount++;
    }

    insertTask(fn) {
        this._queue.unshift(fn);
        this._tasksCount++;
    }

    run() {
        this._checkFrameRequest();
        this.stopped = false;
        this._loopTasks();
    }

    _loopTasks() {

        var task;
        var duration;
        var frameDuration = 0;
        var isTimeoutReached;
        var isFrameTimeoutReached;
        while (
            !this.stopped &&
            !(isTimeoutReached = this._syncDuration > this.timeout) &&
            !(isFrameTimeoutReached = frameDuration > this.syncInterval) &&
            (task = this._queue.shift())
        ) {
            duration = this._runTask(task);
            this._syncDuration += duration;
            this._asyncDuration += duration;
            frameDuration += duration;
        }

        if (isTimeoutReached) {
            this.callbacks.timeout.call(null,
                this._asyncDuration,
                this,
                this._syncDuration);
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
            this.callbacks.done.call(null,
                this._result,
                this,
                this._asyncDuration,
                this._syncDuration);
        }
    }

    _runTask(task) {
        var start = performance.now();
        this._result = task.call(null,
            this._result,
            this);
        var end = performance.now();
        var duration = (end - start);
        this._finishedTasksCount++;
        this.callbacks.progress.call(null,
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

    _checkFrameRequest() {
        if (this._requestedFrameId) {
            throw new Error('Task Runner is waiting for the next frame');
        }
    }

    stop() {
        this.stopped = true;
        cancelAnimationFrame(this._requestedFrameId);
        this._requestedFrameId = null;
    }
}
