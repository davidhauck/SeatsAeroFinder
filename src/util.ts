// Please make this better (the whole time thing in this project). I'm too lazy.
export function newDateWithoutTime() {
    const date = new Date()
    return new Date(date.toISOString().split('T')[0])
}