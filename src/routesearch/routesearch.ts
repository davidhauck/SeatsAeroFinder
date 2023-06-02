import { Database } from "../db/db.js";
import { printAvailabilities } from "../output.js";

export class RouteSearch {
    db: Database
    opts: RouteSearchOptions

    constructor(db: Database, opts: RouteSearchOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.to = this.opts.to.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
    }

    async find() {
        console.log("from: ", this.opts.from)
        console.log("to: ", this.opts.to)
        var r = await this.db.findRoute(this.opts.from, this.opts.to, {
            class: this.opts.class,
            directOnly: this.opts.direct,
            dateStart: this.opts.startDate ? new Date(this.opts.startDate) : undefined,
            dateEnd: this.opts.endDate ? new Date(this.opts.endDate) : undefined,
        })
        console.log("num results: ", r.length)
        printAvailabilities(r, this.opts.class)
    }
}

export interface RouteSearchOptions {
    class: string[]
    from: string[]
    to: string[]
    direct: boolean
    startDate?: string
    endDate?: string
}