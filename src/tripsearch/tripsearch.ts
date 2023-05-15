import { addDays } from "../constants.js";
import { Database } from "../db/db.js";
import { printAvailabilities } from "../output.js";
import { Availability } from "../types.js";
import { newDateWithoutTime } from "../util.js";

export class TripSearch {
    db: Database
    opts: TripSearchOptions
    defaultDaysPerAirport: string = "7-14"

    constructor(db: Database, opts: TripSearchOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.to = this.opts.to.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
    }

    async find() {
        console.log("from: ", this.opts.from)
        console.log("to: ", this.opts.to)

        const destinations = new Map<string, AirportStop>()
        for (const t of this.opts.to) {
            const parts = t.split(':')
            const ap: AirportStop = {}
            if (parts.length == 2) {
                const days = parts[1].split('-')
                ap.minDays = Number(days[0])
                ap.maxDays = Number(days[1])
            }
            destinations.set(parts[0], ap)
        }

        let minDays = 0
        let maxDays = 500
        if (this.opts.startDate) {
            minDays = this.dateDiffInDays(new Date(this.opts.startDate), newDateWithoutTime())
        }
        if (this.opts.endDate) {
            maxDays = this.dateDiffInDays(new Date(this.opts.endDate), newDateWithoutTime())
        }

        var results: Availability[][] = []
        for (const startAirport of this.opts.from) {
            var trips = await this.findNextLeg(startAirport, destinations, newDateWithoutTime(), minDays, maxDays)
            results.push(...trips)
        }

        this.sortResults(results)

        for (const r of results) {
            printAvailabilities(r, this.opts.class)
        }
        console.log(results.length)
    }

    async findNextLeg(currentAirport: string, nextAirports: Map<string, AirportStop>, currentDate: Date, minDaysStay?: number, maxDaysStay?: number): Promise<Availability[][]> {
        const findOptions = {
            class: this.opts.class,
            directOnly: this.opts.direct,
            dateStart: addDays(currentDate, minDaysStay ?? 10),
            dateEnd: addDays(currentDate, maxDaysStay ?? 11),
        }
        var toRet: Availability[][] = []
        if (nextAirports.size == 0) {
            const rs = await this.db.find([currentAirport], this.opts.from, findOptions)
            for (const r of rs) {
                toRet.push([r])
            }
            return toRet
        }

        const rs = await this.db.find([currentAirport], Array.from(nextAirports.keys()), findOptions)
        for (const r of rs) {
            const filteredAirports = this.copyAirports(nextAirports)
            const currAirport = filteredAirports.get(r.Route.DestinationAirport)
            filteredAirports.delete(r.Route.DestinationAirport)
            const nextLegs = await this.findNextLeg(r.Route.DestinationAirport, filteredAirports, new Date(r.Date), currAirport?.minDays, currAirport?.maxDays)

            for (const nl of nextLegs) {
                nl.unshift(r)
                toRet.push(nl)
            }
        }
        return toRet
    }

    sortResults(results: Availability[][]) {
        results.sort((a, b) => {
            var aTotal = a.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
            var bTotal = b.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
            return bTotal - aTotal
        })
    }

    copyAirports(airports: Map<string, AirportStop>): Map<string, AirportStop> {
        const toRet = new Map<string, AirportStop>()
        for (const a of airports) {
            toRet.set(a[0], a[1])
        }
        return toRet
    }

    dateDiffInDays(a: Date, b: Date) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        return Math.floor((a.valueOf() - b.valueOf()) / _MS_PER_DAY);
    }
}

export interface TripSearchOptions {
    class: string[]
    from: string[]
    to: string[]
    direct: boolean
    startDate?: string
    endDate?: string
}

interface AirportStop {
    minDays?: number
    maxDays?: number
}