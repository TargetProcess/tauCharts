export class AnnealingSimulator {

    constructor(config) {
        this.minError = Number.MAX_VALUE;
        this.items = config.items;
        this.revision = this.items.map((row) => ({i: row.i, x: row.x, y: row.y}));
        this.penalties = config.penalties;
        this.transactor = config.transactor;
        this.cooling_schedule = config.cooling_schedule || ((ti, t0, n) => (ti - (t0 / n)));
    }

    energy(index) {
        return this.penalties.reduce((memo, p) => memo + p(index), 0);
    }

    move(temperature) {

        const i = Math.floor(Math.random() * this.items.length);

        const trans = this.transactor(this.items[i]);
        const prevEnergy = this.energy(i);
        this.items[i] = trans.modify();
        const nextEnergy = this.energy(i);

        const de = nextEnergy - prevEnergy;
        const acceptanceProbability = (de < 0) ? 1 : Math.exp(-de / temperature);

        if (Math.random() >= acceptanceProbability) {
            this.items[i] = trans.revert();
        } else if (nextEnergy < this.minError) {
            this.minError = nextEnergy;
            this.revision = this.items.map((row) => ({i: row.i, x: row.x, y: row.y}));
        }
    }

    start(nIterations) {
        // main simulated annealing function
        var ti = 1.0;
        const t0 = 1.0;
        const itemsLength = this.items.length;
        mining: for (let i = 0; i < nIterations; i++) {
            for (let m = 0; m < itemsLength; m++) {
                this.move(ti);
                if (this.minError <= 10) {
                    break mining;
                }
            }
            ti = this.cooling_schedule(ti, t0, nIterations);
        }

        return this.revision;
    }
}
