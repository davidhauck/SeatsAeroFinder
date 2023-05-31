import { Availability } from "./types";
import Table from 'cli-table'
import { toYMD } from "./util.js";

const aliases: any = {
    "From": "Route.OriginAirport",
    "To": "Route.DestinationAirport",
    "YSeats": "YRemainingSeats",
    "WSeats": "WRemainingSeats",
    "JSeats": "JRemainingSeats",
    "FSeats": "FRemainingSeats",
    "YCost": "YMileageCost",
    "WCost": "WMileageCost",
    "JCost": "JMileageCost",
    "FCost": "FMileageCost",
}

const propsForClass: any = {
    "Y": ["YSeats", "YCost", "YDirect"],
    "W": ["WSeats", "WCost", "WDirect"],
    "J": ["JSeats", "JCost", "JDirect"],
    "F": ["FSeats", "FCost", "FDirect"],
}

export function printAvailabilities(as: Availability[], classes: string[]) {
    var cols: string[] = ["Date", "From", "To", "Source"]
    for (const c of classes) {
        cols.push(...propsForClass[c])
    }

    var table = new Table({
        head: cols,
    })
    for (const a of as) {
        const obj = []
        for (const c of cols) {
            if (c == "Date") {
                if (a.CombinedDates && a.CombinedDates.length > 0) {
                    obj.push(a.CombinedDates.map(d => toYMD(d)).join(","))
                    continue
                }
            }

            let currObj = <any>a
            let unaliasedC = c
            if (aliases.hasOwnProperty(c)) {
                unaliasedC = aliases[c]
            }
            var iProps = unaliasedC.split(".")
            for (let iProp of iProps) {
                if (!currObj.hasOwnProperty(iProp)) {
                    throw new Error("Invalid property: " + iProp + ": " + JSON.stringify(currObj))
                }
                currObj = currObj[iProp]
            }
            if (currObj === undefined || currObj === null) {
                currObj = ""
            }
            obj.push(currObj)
        }
        table.push(obj)
    }
    console.log(table.toString())
}