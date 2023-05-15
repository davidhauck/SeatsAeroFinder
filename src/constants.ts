export const sources = [
    "lifemiles",
    "aeroplan",
    "aeromexico",
    "american",
    "delta",
    "emirates",
    //"etihad",
    "united",
    "virginatlantic"
]

export function addDays(date: Date, days: number): Date {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + days);
    return newDate;
}