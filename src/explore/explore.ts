import _ from "lodash"
import { addDays } from "../constants.js"
import { Database, FilterType, GlobalFilter } from "../db/db.js"
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
    fromAirportsWithoutWeight: string[] = []
    fromAirportWeights: Map<string, number> = new Map<string, number>()

    constructor(db: Database, opts: ExploreOptions) {
        this.db = db
        this.opts = opts
        this.opts.from = this.opts.from.map((x) => x.toUpperCase())
        this.opts.class = this.opts.class.map((x) => x.toUpperCase())
        this.minDaysStay = this.opts.minDaysStay ? Number.parseInt(this.opts.minDaysStay) : 7
        this.maxDaysStay = this.opts.maxDaysStay ? Number.parseInt(this.opts.maxDaysStay) : 14
        for (const a of this.opts.from) {
            if (a.includes(":")) {
                const parts = a.split(":")
                this.fromAirportsWithoutWeight.push(parts[0])
                this.fromAirportWeights.set(parts[0], Number.parseInt(parts[1]))
            } else {
                this.fromAirportsWithoutWeight.push(a)
                this.fromAirportWeights.set(a, 1)
            }
        }
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

        const eas: GlobalFilter[] = []
        if (this.opts.excludeAirports) {
            for (const ea of this.opts.excludeAirports) {
                eas.push({ type: FilterType.ExcludeAirport, value: ea })
            }
        }
        if (this.opts.excludeSources) {
            for (const es of this.opts.excludeSources) {
                eas.push({ type: FilterType.ExcludeSource, value: es })
            }
        }
        await this.db.addGlobalFilters(eas)

        const results: Availability[][] = []
        for (const f of this.fromAirportsWithoutWeight) {
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

        this.collapseLowerPriorityAirports(toRet)

        return toRet
    }

    collapseLowerPriorityAirports(ers: ExploreResult[]) {
        for (let i = 0; i < ers.length; i++) {
            for (let j = i + 1; j < ers.length; j++) {
                if (ers[i].visitedAirports.length != ers[j].visitedAirports.length) {
                    continue
                }
                let sameAirports = true
                for (let k = 1; k < ers[i].visitedAirports.length - 1; k++) {
                    if (ers[i].visitedAirports[k] != ers[j].visitedAirports[k]) {
                        sameAirports = false
                        break
                    }
                }
                if (!sameAirports) {
                    continue
                }

                let iFirstWeight = this.fromAirportWeights.get(ers[i].visitedAirports[0])
                if (iFirstWeight === undefined) {
                    iFirstWeight = 1
                }
                let iLastWeight = this.fromAirportWeights.get(ers[i].visitedAirports[ers[i].visitedAirports.length - 1])
                if (iLastWeight === undefined) {
                    iLastWeight = 1
                }
                let jFirstWeight = this.fromAirportWeights.get(ers[j].visitedAirports[0])
                if (jFirstWeight === undefined) {
                    jFirstWeight = 1
                }
                let jLastWeight = this.fromAirportWeights.get(ers[j].visitedAirports[ers[i].visitedAirports.length - 1])
                if (jLastWeight === undefined) {
                    jLastWeight = 1
                }

                if (iFirstWeight + iLastWeight == jFirstWeight + jLastWeight) {
                    continue
                }

                if (iFirstWeight + iLastWeight > jFirstWeight + jLastWeight) {
                    ers.splice(i, 1)
                    i--
                    break
                }

                ers.splice(j, 1)
                j--
            }
        }
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
            const finalLegs = await this.db.findRoute([currentAirport], this.fromAirportsWithoutWeight, findOptions)
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
    excludeSources?: string[]
    numDestinations?: string
    minDaysStay?: string
    maxDaysStay?: string
}
