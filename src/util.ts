import { Availability, Route } from "./types"
import { deserialize, serialize } from "v8";

export const structuredClone = (obj: any) => {
    return deserialize(serialize(obj));
};

// Please make this better (the whole time thing in this project). I'm too lazy.
export function newDateWithoutTime() {
    const date = new Date()
    return new Date(date.toISOString().split('T')[0])
}


export function sortResults(results: Availability[][]) {
    results.sort((a, b) => {
        var aTotal = a.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
        var bTotal = b.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
        return bTotal - aTotal
    })
}

export interface ItineraryPrice {
    Y: Number
    J: Number
    F: Number
    W: Number
}


export interface ExploreResult {
    visitedAirports: string[]
    possibleDates: string[]
}

export function priceItinerary(as: Availability[]): ItineraryPrice {
    let sumY = 0
    let sumJ = 0
    let sumF = 0
    let sumW = 0
    for (const a of as) {
        sumY += a.YMileageCost
        sumJ += a.JMileageCost
        sumF += a.FMileageCost
        sumW += a.WMileageCost
    }
    return {
        F: sumF,
        J: sumJ,
        W: sumW,
        Y: sumY,
    }
}

export function newAvailability(a: NewAvailabilityArgs): Availability {
    return {
        APITermsOfUse: a.APITermsOfUse ?? "",
        ComputedLastSeen: a.ComputedLastSeen ?? "",
        Date: a.Date ?? "",
        FAirlines: a.FAirlines ?? "",
        FAvailable: a.FAvailable ?? false,
        FDirect: a.FDirect ?? false,
        FMileageCost: a.FMileageCost ?? 0,
        FRemainingSeats: a.FRemainingSeats ?? 0,
        ID: a.ID ?? "",
        JAirlines: a.JAirlines ?? "",
        JAvailable: a.JAvailable ?? false,
        JDirect: a.JDirect ?? false,
        JMileageCost: a.JMileageCost ?? 0,
        JRemainingSeats: a.JRemainingSeats ?? 0,
        ParsedDate: a.ParsedDate ?? "",
        Route: a.Route ?? {
            AutoCreated: false,
            DestinationAirport: "",
            DestinationRegion: "",
            Distance: 0,
            ID: "",
            NumDaysOut: 0,
            OriginAirport: "",
            OriginRegion: "",
            Source: "",
        },
        RouteID: a.RouteID ?? "",
        Source: a.Source ?? "",
        WAirlines: a.WAirlines ?? "",
        WAvailable: a.WAvailable ?? false,
        WDirect: a.WDirect ?? false,
        WMileageCost: a.WMileageCost ?? 0,
        WRemainingSeats: a.WRemainingSeats ?? 0,
        YAirlines: a.YAirlines ?? "",
        YAvailable: a.YAvailable ?? false,
        YDirect: a.YDirect ?? false,
        YMileageCost: a.YMileageCost ?? 0,
        YRemainingSeats: a.YRemainingSeats ?? 0,

        CombinedDates: new Array<Date>(),
    }
}

export function compareAvail(first: Availability, second: Availability): boolean {
    if (first.Source == "" && second.Source == "") {
        return true
    }
    if (first.Date != second.Date ||
        first.Route.OriginAirport != second.Route.OriginAirport ||
        first.Route.DestinationAirport != second.Route.DestinationAirport ||
        first.Source != second.Source) {
        return false
    }
    return true
}

export function toYMD(d: Date): string {
    var month = d.getUTCMonth() + 1; //months from 1-12
    var day = d.getUTCDate();
    var year = d.getUTCFullYear();

    let monthStr: string = month.toString()
    if (monthStr.length == 1) {
        monthStr = "0" + monthStr
    }
    return year + "-" + monthStr + "-" + day;
}

interface NewAvailabilityArgs {
    ID?: string
    RouteID?: string
    Route?: Route
    Date?: string
    ParsedDate?: string

    YAvailable?: boolean
    WAvailable?: boolean
    JAvailable?: boolean
    FAvailable?: boolean

    YMileageCost?: number
    WMileageCost?: number
    JMileageCost?: number
    FMileageCost?: number

    YRemainingSeats?: number
    WRemainingSeats?: number
    JRemainingSeats?: number
    FRemainingSeats?: number

    YAirlines?: string
    WAirlines?: string
    JAirlines?: string
    FAirlines?: string

    YDirect?: boolean
    WDirect?: boolean
    JDirect?: boolean
    FDirect?: boolean

    Source?: string
    ComputedLastSeen?: string
    APITermsOfUse?: string
}