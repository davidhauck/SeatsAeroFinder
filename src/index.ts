import { Command } from 'commander'
import { RouteSearch } from './routesearch/routesearch.js';
import { Database } from "./db/db.js";
import { TripSearch } from './tripsearch/tripsearch.js';
import { Explore } from './explore/explore.js';


const version = "1.0.0"
const url: string = 'http://google.com';

const program = new Command("SeatsAeroFinder")

program
    .version(version)
    .description("Helps find availability based on data from seats.aero")

program.command('routesearch')
    .action(async (options, command) => {
        var db: Database = new Database(options.folder)
        await db.connect()
        var f: RouteSearch = new RouteSearch(db, options)
        await f.find()
    })
    .option("-c, --class <value...>", "List of classes to search. Defaults to all of Y, W, J, and F", ["Y", "W", "J", "F"])
    .option("--folder <value>", "folder to store flight data.")
    .option("-d, --direct")
    .option("-s, --start-date <value>", "Date to start search.")
    .option("-e, --end-date <value", "Date to end search")
    .requiredOption("-f, --from <value...>", "List of airports to search from.")
    .requiredOption("-t, --to <value...>", "List of airports to search to.")

program.command('tripsearch')
    .action(async (options, command) => {
        var db: Database = new Database(options.folder)
        await db.connect()
        var t: TripSearch = new TripSearch(db, options)
        await t.find()
    })
    .option("-c, --class <value...>", "List of classes to search. Defaults to all of Y, W, J, and F", ["Y", "W", "J", "F"])
    .option("--folder <value>", "folder to store flight data.")
    .option("-d, --direct")
    .option("-s, --start-date <value>", "Date to start search.")
    .option("-e, --end-date <value>", "Date to end search *for the first flight*. The entire trip may take go past this date.")
    .option("--non-point-segments <value...>", "Segments that the algorithm will allow for \"free.\" Useful for short haul flights or allowing the algorithm to use multiple airports in a single city (e.g. HND-NRT).")
    .requiredOption("-f, --from <value...>", "List of airports to search from.")
    .requiredOption("-t, --to <value...>", "List of airports to search to. Optionally specify the number of days to stay at each airport with a colon and then time range (e.g. '-to ZRH:5-10' to stay in ZRH between 5 and 10 days)")

program.command('explore')
    .action(async (options, command) => {
        var db: Database = new Database(options.folder)
        await db.connect()
        var t: Explore = new Explore(db, options)
        await t.explore()
    })
    .option("-c, --class <value...>", "List of classes to search. Defaults to all of Y, W, J, and F", ["Y", "W", "J", "F"])
    .option("--folder <value>", "folder to store flight data.")
    .option("-d, --direct", "Only search direct flights.")
    .option("--exclude-regions <value...>", "Do no search for designations in regions listed here. Options are Europe, North America, South America, Africa, Asia, Oceania")
    .option("-e, --exclude-airports <value...>", "Do not search for these airport codes.")
    .option("-n, --num-destinations <value>")
    .requiredOption("-f, --from <value...>", "List of airports to search from.")

program.parse(process.argv)