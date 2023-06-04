import { addDays } from "../constants.js";
import { Database } from "../db/db.js";
import { printAvailabilities } from "../output.js";
import { Availability } from "../types.js";
import { compareAvail, newAvailability, newDateWithoutTime, sortResults, structuredClone, toYMD } from "../util.js";

export class TripSearch {
    db: Database
    opts: TripSearchOptions
    defaultDaysPerAirport: string = "7-14"
    nonPointSegments = new Map<string, string[]>()

    constructor(db: Database, opts: TripSearchOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.to = this.opts.to.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
        if (opts.nonPointSegments) {
            this.initializeNonPointSegments(opts.nonPointSegments)
        }
    }

    initializeNonPointSegments(nonPointSegments: string[]) {
        for (const s of nonPointSegments) {
            const parts = s.split("-")
            parts[0] = parts[0].toUpperCase()
            parts[1] = parts[1].toUpperCase()
            const v = this.nonPointSegments.get(parts[0])
            if (v != undefined) {
                this.nonPointSegments.set(parts[0], v.concat(parts[1]))
            } else {
                this.nonPointSegments.set(parts[0], [parts[1]])
            }
            const v2 = this.nonPointSegments.get(parts[1])
            if (v2 != undefined) {
                this.nonPointSegments.set(parts[1], v2.concat(parts[0]))
            } else {
                this.nonPointSegments.set(parts[1], [parts[0]])
            }
        }
    }

    async find() {
        const start = Date.now()
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

        sortResults(results, this.opts.class, this.opts.direct)

        this.collapseResults(results)

        for (const r of results) {
            printAvailabilities(r, this.opts.class)
        }
        const end = Date.now()
        console.log("Time: ", end - start)
    }

    async findNextLeg(currentAirport: string, nextAirports: Map<string, AirportStop>, currentDate: Date, minDaysStay?: number, maxDaysStay?: number): Promise<Availability[][]> {
        if (minDaysStay === undefined) {
            minDaysStay = 7
        }
        if (maxDaysStay === undefined) {
            maxDaysStay = 14
        }
        const findOptions = {
            class: this.opts.class,
            directOnly: this.opts.direct,
            dateStart: addDays(currentDate, minDaysStay),
            dateEnd: addDays(currentDate, maxDaysStay),
        }
        var toRet: Availability[][] = []

        // If at a leaf node, find all return routes back to an original airport.
        if (nextAirports.size == 0) {
            const rs = await this.db.findRoute([currentAirport], this.opts.from, findOptions)
            for (const r of rs) {
                toRet.push([r])
            }
            return toRet
        }

        // Find all routes from the currnt location to any of the next locations.
        const rs = await this.db.findRoute([currentAirport], Array.from(nextAirports.keys()), findOptions)
        // Find non point options.
        const nonPointRs = this.findNonPointSegments(currentAirport, currentDate, minDaysStay, maxDaysStay)
        rs.push(...nonPointRs)
        for (const r of rs) {
            const filteredAirports = this.copyAirports(nextAirports)
            const currAirport = filteredAirports.get(r.Route.DestinationAirport)
            filteredAirports.delete(r.Route.DestinationAirport)
            const nextLegs = await this.findNextLeg(r.Route.DestinationAirport, filteredAirports, new Date(r.Date), currAirport?.minDays, currAirport?.maxDays)

            for (const nl of nextLegs) {
                nl.unshift(r)
                toRet.push(structuredClone(nl))
            }
        }

        return toRet
    }

    findNonPointSegments(currentAirport: string, currentDate: Date, minDaysStay: number, maxDaysStay: number): Availability[] {
        const v = this.nonPointSegments.get(currentAirport)
        if (v === undefined) {
            return []
        }

        const toRet: Availability[] = []

        for (const a of v) {
            for (let i = minDaysStay; i <= maxDaysStay; i++) {
                toRet.push(newAvailability({
                    Date: toYMD(addDays(currentDate, i)),
                    Route: {
                        AutoCreated: false,
                        DestinationAirport: a,
                        DestinationRegion: "",
                        Distance: 0,
                        ID: "",
                        NumDaysOut: 0,
                        OriginAirport: currentAirport,
                        OriginRegion: "",
                        Source: "n/a",
                    }
                }))
            }
        }

        return toRet
    }

    collapseResults(results: Availability[][]) {
        // Collapse any that are identical other than non-point segments
        for (let i = 0; i < results.length; i++) {
            const current = results[i]
            for (let j = 0; j < results.length; j++) {

                if (i == j) {
                    continue
                }
                const other = results[j]
                if (current.length != other.length) {
                    continue
                }

                let isEqual = true
                for (let k = 0; k < current.length; k++) {
                    if (!compareAvail(current[k], other[k])) {
                        isEqual = false
                        break
                    }
                }
                if (!isEqual) {
                    continue
                }
                // It is the same, combine it.
                for (let k = 0; k < current.length; k++) {
                    if (current[k].Date != other[k].Date) {
                        if (!current[k].CombinedDates || current[k].CombinedDates?.length == 0) {
                            current[k].CombinedDates?.push(new Date(current[k].Date))
                        }
                        current[k].CombinedDates?.push(new Date(other[k].Date))
                    }
                }
                results.splice(j, 1)
                if (j < i) {
                    i--
                }
            }
        }

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
    nonPointSegments: string[]
}

interface AirportStop {
    minDays?: number
    maxDays?: number
}