export class AnnealingSimulator {

    constructor(config) {
        this.items = config.items;
        this.penalties = config.penalties;
        this.transactor = config.transactor;
        this.cooling_schedule = config.cooling_schedule || ((ti, t0, n) => (ti - (t0 / n)));
    }

    energy(index) {
        return this.penalties.reduce((memo, p) => memo + p(index), 0);
    }

    move(temperature) {

        var i = Math.floor(Math.random() * this.items.length);

        var trans = this.transactor(this.items[i]);
        var prevEnergy = this.energy(i);
        this.items[i] = trans.modify();
        var nextEnergy = this.energy(i);

        if (Math.random() >= Math.exp(-(nextEnergy - prevEnergy) / temperature)) {
            this.items[i] = trans.revert();
        }
    }

    start(nIterations) {
        // main simulated annealing function
        var ti = 1.0;
        var t0 = 1.0;
        for (var i = 0; i < nIterations; i++) {
            this.items.forEach(() => this.move(ti));
            ti = this.cooling_schedule(ti, t0, nIterations);
        }
    }
}