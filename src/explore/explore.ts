import _ from "lodash"
import { addDays } from "../constants.js"
import { Database, FilterType } from "../db/db.js"
import { printAvailabilities, printExploreResults } from "../output.js"
import { Availability, ExploreResult } from "../types.js"
import { newDateWithoutTime, priceSummary, sortResults, structuredClone } from "../util.js"

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
        let numDestinations = 1
        if (!this.opts.numDestinations) {
            numDestinations = 1
        } else {
            numDestinations = Number.parseInt(this.opts.numDestinations)
            if (numDestinations <= 0) {
                numDestinations = 1
            }
        }

        if (this.opts.excludeAirports) {
            for (const ea of this.opts.excludeAirports) {
                await this.db.addGlobalFilter({ type: FilterType.ExcludeAirport, value: ea })
            }
        }

        const results: Availability[][] = []
        for (const f of this.opts.from) {
            const options = await this.findNextDestination(f, numDestinations, newDateWithoutTime(), 0, 500)
            results.push(...options)
        }

        sortResults(results, this.opts.class, true)
        const exploreResults = this.collapseResults(results)

        printExploreResults(exploreResults)
        console.log("Num results: ", results.length)
    }


    collapseResults(results: Availability[][]): ExploreResult[] {
        const toRet: ExploreResult[] = []
        const rs: Availability[][] = structuredClone(results)
        while (rs.length > 0) {
            const dates = []
            // Take the last one since the array is reverse sorted and best flights are last
            const route = rs.splice(rs.length - 1, 1)[0]
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

            toRet.unshift({
                possibleDates: _.uniq(dates).sort(),
                visitedAirports: itin,
                examplePrice: priceSummary(route, this.opts.direct, this.opts.class),
            })

            if (itin.includes("ADD") && itin.includes("ZRH")) {
                printAvailabilities(route, ["J"])
            }
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
        for (let i = 0; i < possibleNextLegs.length; i++) {
            if (this.opts.excludeRegions) {
                if (this.opts.excludeRegions.includes(possibleNextLegs[i].Route.DestinationRegion)) {
                    possibleNextLegs.splice(i, 1)
                    i--
                }
            }
        }

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
    excludeRegions?: string[]
    excludeAirports?: string[]
    numDestinations?: string
    minDaysStay?: string
    maxDaysStay?: string
}
