import os from "os"
import { Low } from 'lowdb'
import { Availability } from '../types'
import { JSONFile } from 'lowdb/node'
import { sources } from "../constants.js"
import got from 'got'
import _, { xor } from "lodash"

export class Database {
    folderPath: string
    dbs: Map<string, Low<Availability[]>>
    memoryDb: Availability[]
    metadata: Low<Metadata>
    hasLoaded: boolean
    originIndexes: Map<string, number[]>
    destinationIndexes: Map<string, number[]>
    globalFilters: GlobalFilter[] = []

    constructor(folderPath: string = "") {
        if (folderPath == "") {
            folderPath = os.homedir() + "/SeatsAeroFinder/"
        }
        this.folderPath = folderPath
        const metadataAdapter = new JSONFile<Metadata>(this.folderPath + "metadata.json")
        this.metadata = new Low<Metadata>(metadataAdapter, <Metadata>{ refreshTimes: {} })
        this.dbs = new Map<string, Low<Availability[]>>()
        this.hasLoaded = false
        this.originIndexes = new Map<string, number[]>()
        this.destinationIndexes = new Map<string, number[]>()
        this.memoryDb = []
    }

    async connect() {
        const start = Date.now()
        for (let source of sources) {
            const fullName = this.folderPath + source + ".json"
            const adapter = new JSONFile<Availability[]>(fullName)
            const db = new Low<Availability[]>(adapter, <Availability[]>[])
            await db.read()
            this.dbs.set(source, db)
        }
        await this.metadata.read()
        const end = Date.now()
        console.log("Finished reading stored db ", end - start, "ms")
        await this.refresh()
    }

    async refresh(force: boolean = false) {
        if (this.hasLoaded) {
            return
        }
        const start = Date.now()
        for (const source of sources) {
            const lastRefreshedString = this.metadata.data.refreshTimes[source]
            var lastRefreshed: Date = lastRefreshedString ? new Date(lastRefreshedString) : new Date(0)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if (!lastRefreshed || lastRefreshed < yesterday) {
                console.log("refreshing source: ", source)
                await this.refreshSource(source)
                this.metadata.data.refreshTimes[source] = new Date().toString()
            }
        }
        await this.metadata.write()
        this.hasLoaded = true
        const end = Date.now()
        console.log("finished refreshing data ", end - start, "ms")
        await this.updateMemoryDb()
    }

    async addGlobalFilter(f: GlobalFilter) {
        this.globalFilters.push(f)
        await this.updateMemoryDb()
    }

    updateMemoryDb() {
        const start = Date.now()
        this.memoryDb = []
        for (let key of this.dbs.keys()) {
            const db = this.dbs.get(key)
            if (!db) {
                continue
            }
            for (const a of db.data) {
                if (!this.isFiltered(a)) {
                    if (a.Route.DestinationAirport == "DXB" && this.globalFilters.length == 3) {
                        console.log("HEHEH", a)
                    }
                    this.memoryDb.push(a)
                }
            }
        }
        this.updateIndexes()
        const end = Date.now()
        console.log("finished building db in memory ", end - start, "ms")
    }

    isFiltered(a: Availability): boolean {
        for (const f of this.globalFilters) {
            if (f.type == FilterType.ExcludeAirport) {
                if (a.Route.DestinationAirport.toUpperCase() == f.value.toUpperCase() || a.Route.OriginAirport.toUpperCase() == f.value.toUpperCase()) {
                    return true
                }
            }
        }
        return false
    }

    updateIndexes() {
        this.originIndexes.clear()
        this.destinationIndexes.clear()
        for (let i = 0; i < this.memoryDb.length; i++) {
            const a = this.memoryDb[i]

            let origin = this.originIndexes.get(a.Route.OriginAirport)
            if (!origin) {
                origin = []
            }
            origin.push(i)
            this.originIndexes.set(a.Route.OriginAirport, origin)


            let destination = this.destinationIndexes.get(a.Route.DestinationAirport)
            if (!destination) {
                destination = []
            }
            destination.push(i)
            this.destinationIndexes.set(a.Route.DestinationAirport, destination)

        }
    }

    async refreshSource(source: string): Promise<void> {
        const data = await got.get<Availability[]>("https://seats.aero/api/availability?source=" + source).json<Availability[]>()
        const db = this.dbs.get(source)
        if (!db) {
            throw new Error("Invalid Source")
        }
        db.data = data
        await db.write()
    }

    async findRoute(from: string[], to: string[], opts: FindOptions): Promise<Availability[]> {
        var response: Availability[] = []
        this.filteredForeach(from, to, (a: Availability) => {
            if (
                opts.class && this.containsService(a, opts.class, opts.directOnly) &&
                (!opts.dateEnd || new Date(a.Date) <= opts.dateEnd) &&
                (!opts.dateStart || new Date(a.Date) >= opts.dateStart)) {
                response.push(a)
            }
        })

        return response
    }

    async findAllLeavingAirport(from: string, opts: FindOptions): Promise<Availability[]> {
        var response: Availability[] = []
        this.filteredForeach([from], [], (a: Availability) => {
            if (
                opts.class && this.containsService(a, opts.class, opts.directOnly) &&
                (!opts.dateEnd || new Date(a.Date) <= opts.dateEnd) &&
                (!opts.dateStart || new Date(a.Date) >= opts.dateStart)) {
                response.push(a)
            }
        })

        return response
    }

    filteredForeach(from: string[], to: string[], callback: (a: Availability) => void) {
        const fromIndexes: number[][] = []
        for (const f of from) {
            fromIndexes.push(this.originIndexes.get(f) ?? [])
        }
        const fromIndexUnion = _.union(...fromIndexes)

        const toIndexes: number[][] = []
        for (const t of to) {
            toIndexes.push(this.destinationIndexes.get(t) ?? [])
        }
        const toIndexUnion = _.union(...toIndexes)

        // If there are no "to" airports, ignore them and return all flights from the "from" airports
        const intersection = to.length > 0 ? _.intersection(fromIndexUnion, toIndexUnion) : fromIndexUnion

        for (const n of intersection) {
            callback(this.memoryDb[n])
        }
    }

    containsService(a: Availability, classes: string[], directOnly?: boolean): boolean {
        if (classes.includes("Y") && Number.parseInt(a.YMileageCost) > 0 && (!directOnly || a.YDirect)) {
            return true
        }
        if (classes.includes("W") && Number.parseInt(a.WMileageCost) > 0 && (!directOnly || a.WDirect)) {
            return true
        }
        if (classes.includes("J") && Number.parseInt(a.JMileageCost) > 0 && (!directOnly || a.JDirect)) {
            return true
        }
        if (classes.includes("F") && Number.parseInt(a.FMileageCost) > 0 && (!directOnly || a.FDirect)) {
            return true
        }
        return false
    }
}

interface Metadata {
    refreshTimes: { [key: string]: string } // string to string map
}

interface FindOptions {
    class?: string[]
    directOnly?: boolean
    dateStart?: Date
    dateEnd?: Date
}

interface GlobalFilter {
    type: FilterType
    value: string
}

export enum FilterType {
    ExcludeAirport,
}