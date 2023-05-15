import os from "os"
import { Low } from 'lowdb'
import { Availability } from '../types'
import { JSONFile } from 'lowdb/node'
import { sources } from "../constants.js"
import got from 'got'

export class Database {
    folderPath: string
    dbs: Map<string, Low<Availability[]>>
    metadata: Low<Metadata>
    hasLoaded: boolean

    constructor(folderPath: string = "") {
        if (folderPath == "") {
            folderPath = os.homedir() + "/SeatsAeroFinder/"
        }
        this.folderPath = folderPath
        const metadataAdapter = new JSONFile<Metadata>(this.folderPath + "metadata.json")
        this.metadata = new Low<Metadata>(metadataAdapter, <Metadata>{ refreshTimes: {} })
        this.dbs = new Map<string, Low<Availability[]>>()
        this.hasLoaded = false
    }

    async connect() {
        for (let source of sources) {
            const fullName = this.folderPath + source + ".json"
            const adapter = new JSONFile<Availability[]>(fullName)
            const db = new Low<Availability[]>(adapter, <Availability[]>[])
            await db.read()
            this.dbs.set(source, db)
        }
        await this.metadata.read()
    }

    async refresh(force: boolean = false) {
        if (this.hasLoaded) {
            return
        }
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

    async find(from: string[], to: string[], opts: FindOptions): Promise<Availability[]> {
        await this.refresh()
        var response: Availability[] = []
        for (let key of this.dbs.keys()) {
            const db = this.dbs.get(key)
            if (!db) {
                continue
            }
            response.push(...db.data.filter(a =>
                from.includes(a.Route.OriginAirport) &&
                to.includes(a.Route.DestinationAirport) &&
                opts.class && this.containsService(a, opts.class, opts.directOnly) &&
                (!opts.dateEnd || new Date(a.Date) <= opts.dateEnd) &&
                (!opts.dateStart || new Date(a.Date) >= opts.dateStart)))
        }
        response.sort((a, b) => new Date(a.ParsedDate).getTime() - new Date(b.ParsedDate).getTime())
        return response
    }

    containsService(a: Availability, classes: string[], directOnly?: boolean): boolean {
        if (classes.includes("Y") && a.YMileageCost > 0 && (!directOnly || a.YDirect)) {
            return true
        }
        if (classes.includes("W") && a.WMileageCost > 0 && (!directOnly || a.WDirect)) {
            return true
        }
        if (classes.includes("J") && a.JMileageCost > 0 && (!directOnly || a.JDirect)) {
            return true
        }
        if (classes.includes("F") && a.FMileageCost > 0 && (!directOnly || a.FDirect)) {
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