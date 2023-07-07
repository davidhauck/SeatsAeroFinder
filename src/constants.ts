export const sources = [
    "lifemiles",
    "aeroplan",
    "aeromexico",
    "american",
    "delta",
    "emirates",
    //"etihad",
    "united",
    "virginatlantic",
    "alaska",
    "velocity",
]

export function addDays(date: Date, days: number): Date {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export const farePriorities = {
    F: 1, // First Class
    J: 2, // Business Class
    W: 3, // Premium Economy Class
    Y: 4, // Economy Class
}

export const farePriorityList = ["F", "J", "W", "Y"]