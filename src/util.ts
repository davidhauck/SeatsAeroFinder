import { Availability, Route } from "./types.js"
import { deserialize, serialize } from "v8";
import { farePriorityList } from "./constants.js";

export const structuredClone = (obj: any) => {
    return deserialize(serialize(obj));
};

// Please make this better (the whole time thing in this project). I'm too lazy.
export function newDateWithoutTime() {
    const date = new Date()
    return new Date(date.toISOString().split('T')[0])
}


export function sortResults(results: Availability[][], classes: string[], directOnly: boolean, reverse: boolean = false) {
    results.sort((first, second) => {
        let result = 0
        for (const f of farePriorityList) {
            if (!classes.includes(f)) {
                continue
            }
            let firstCount = 0
            for (const a of first) {
                const mc = (<any>a)[f + "MileageCost"]
                const dir = (<any>a)[f + "Direct"]
                if (mc && mc != "0" && (!directOnly || dir)) {
                    firstCount++
                }
            }
            let secondCount = 0
            for (const a of second) {
                const mc = (<any>a)[f + "MileageCost"]
                const dir = (<any>a)[f + "Direct"]
                if (mc && mc != "0" && (!directOnly || dir)) {
                    secondCount++
                }
            }

            if (firstCount != secondCount) {
                result = firstCount - secondCount
                return reverse ? -result : result
            }
        }

        var aTotal = first.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
        var bTotal = second.reduce((acc, curr) => acc + Number(curr.JMileageCost), 0)
        if (reverse) {
            return aTotal - bTotal
        }
        return bTotal - aTotal
    })
}

export function priceSummary(as: Availability[], directOnly: boolean, classes: string[]): string {
    let toRet = ""
    for (const a of as) {
        for (const f of farePriorityList) {
            const mc = (<any>a)[f + "MileageCost"]
            const dir = (<any>a)[f + "Direct"]
            if (!classes.includes(f) || !mc || mc == "0" || (directOnly && !dir)) {
                continue
            }

            toRet += mc + "/" + f + "/" + a.Source + " - "
            break
        }
    }
    return toRet.substring(0, toRet.length - 3)
}

export function newAvailability(a: NewAvailabilityArgs): Availability {
    return {
        APITermsOfUse: a.APITermsOfUse ?? "",
        ComputedLastSeen: a.ComputedLastSeen ?? "",
        Date: a.Date ?? "",
        FAirlines: a.FAirlines ?? "",
        FAvailable: a.FAvailable ?? false,
        FDirect: a.FDirect ?? false,
        FMileageCost: a.FMileageCost ?? "0",
        FRemainingSeats: a.FRemainingSeats ?? 0,
        ID: a.ID ?? "",
        JAirlines: a.JAirlines ?? "",
        JAvailable: a.JAvailable ?? false,
        JDirect: a.JDirect ?? false,
        JMileageCost: a.JMileageCost ?? "0",
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
        WMileageCost: a.WMileageCost ?? "0",
        WRemainingSeats: a.WRemainingSeats ?? 0,
        YAirlines: a.YAirlines ?? "",
        YAvailable: a.YAvailable ?? false,
        YDirect: a.YDirect ?? false,
        YMileageCost: a.YMileageCost ?? "0",
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

    YMileageCost?: string
    WMileageCost?: string
    JMileageCost?: string
    FMileageCost?: string

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