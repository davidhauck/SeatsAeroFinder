import _ from "lodash"
import { addDays } from "../constants.js"
import { Database } from "../db/db.js"
import { printAvailabilities, printExploreResults } from "../output.js"
import { Availability } from "../types.js"
import { ExploreResult, newDateWithoutTime, sortResults, structuredClone } from "../util.js"

export class Explore {
    db: Database
    opts: ExploreOptions
    defaultDaysPerAirport: string = "7-14"
    nonPointSegments = new Map<string, string[]>()
    minDaysStay: number
    maxDaysStay: number

    constructor(db: Database, opts: ExploreOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
        this.minDaysStay = this.opts.minDaysStay ? Number.parseInt(this.opts.minDaysStay) : 7
        this.maxDaysStay = this.opts.maxDaysStay ? Number.parseInt(this.opts.maxDaysStay) : 14
    }

    async explore() {
        const numDestinations = 2

        const results: Availability[][] = []
        for (const f of this.opts.from) {
            const options = await this.findNextDestination(f, numDestinations, newDateWithoutTime(), 0, 500)
            results.push(...options)
        }

        const exploreResults = this.collapseResults(results)

        printExploreResults(exploreResults)
        console.log("Num results: ", results.length)
    }


    collapseResults(results: Availability[][]): ExploreResult[] {
        const toRet: ExploreResult[] = []
        const rs: Availability[][] = structuredClone(results)
        while (rs.length > 0) {
            const dates = []
            const prices = []
            const route = rs.splice(0, 1)[0]
            const itin = this.getItineraryForAvailabilities(route)
            dates.push(route[0].Date)

            for (let i = 0; i < rs.length; i++) {
                const otherItin = this.getItineraryForAvailabilities(rs[i])
                if (itin.length != otherItin.length) {
                    continue
                }
                let isEqual = true
                for (let j = 0; j < itin.length; j++) {
                    if (itin[j] != otherItin[j]) {
                        isEqual = false
                        break
                    }
                }
                if (isEqual) {
                    const other = rs.splice(i, 1)[0]
                    dates.push(other[0].Date)
                    i--
                }
            }

            toRet.push({
                possibleDates: _.uniq(dates).sort(),
                visitedAirports: itin,
            })
        }

        return toRet
    }

    getItineraryForAvailabilities(as: Availability[]): string[] {
        const itinerary = []
        for (const a of as) {
            itinerary.push(a.Route.OriginAirport)
        }
        itinerary.push(as[as.length - 1].Route.DestinationAirport)
        return itinerary
    }

    async findNextDestination(currentAirport: string, numDestinationsLeft: number, currentDate: Date, minDaysStay: number, maxDaysStay: number): Promise<Availability[][]> {
        const findOptions = {
            class: this.opts.class,
            directOnly: this.opts.direct,
            dateStart: addDays(currentDate, minDaysStay),
            dateEnd: addDays(currentDate, maxDaysStay),
        }

        const toRet: Availability[][] = []
        if (numDestinationsLeft == 0) {
            const finalLegs = await this.db.findRoute([currentAirport], this.opts.from, findOptions)
            for (const l of finalLegs) {
                toRet.push([l])
            }
            return toRet
        }


        const possibleNextLegs = await this.db.findAllLeavingAirport(currentAirport, findOptions)

        for (const l of possibleNextLegs) {
            const nextLegs = await this.findNextDestination(l.Route.DestinationAirport, numDestinationsLeft - 1, new Date(l.Date), this.minDaysStay, this.maxDaysStay)

            for (const nl of nextLegs) {
                nl.unshift(l)
                toRet.push(structuredClone(nl))
            }
        }

        return toRet
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
    minDaysStay?: string
    maxDaysStay?: string
}
