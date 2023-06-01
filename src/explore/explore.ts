import { Database } from "../db/db.js"

export class Explore {
    db: Database
    opts: ExploreOptions
    defaultDaysPerAirport: string = "7-14"
    nonPointSegments = new Map<string, string[]>()

    constructor(db: Database, opts: ExploreOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
    }

    async explore() {
    }

    dateDiffInDays(a: Date, b: Date) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        return Math.floor((a.valueOf() - b.valueOf()) / _MS_PER_DAY);
    }
}

export interface ExploreOptions {
    class: string[]
    from: string[]
    direct: boolean
    nonPointSegments: string[]
}
