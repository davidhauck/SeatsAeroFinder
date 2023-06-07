# SeatsAeroFinder

[seats.aero](seats.aero) is one of the best tools to find award ticket availability. Specifically, it's great to search specific routes for specific periods of time. If, however, you want to go on a trip with flexible dates and flexible destinations, it can take a while to search all of the different dates and routes that you might be interested in. Additionally, it can be time consuming to search both legs of a trip at the same time. There may be outbound availability but no return availability.

This tool is meant to generate trip ideas based off of a departure airport(s) using seats.aero data.

There are probably a lot of bugs here as I wrote no tests and wrote the code quickly. Feel free to file issues as you come across them.

## Installation

* Install node and npm: https://nodejs.org/en/download

* Install git: https://git-scm.com/downloads

* Open a command prompt and run the following commands in a new folder:

* git clone https://github.com/davidhauck/SeatsAeroFinder.git

* cd SeatsAeroFinder

* npm i

* npm run (explore|tripsearch|routesearch)

## Usage

### Basic Example

Explore is the core command used to find trips from home airport(s). In this example, we will be searching for trips to two different cities from ORD.
```
$ npm run explore -- --from ord --class F J -d --exclude-regions "North America" -n 2

┌─────────────────┬─────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
│ Itinerary       │ Dates                                               │ Example Price                                             │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-MUC-DXB-ORD │ 2023-07-03  2023-07-04                              │ 63000/J/lifemiles - 87000/J/emirates - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ZRH-DXB-ORD │ 2023-07-04  2023-07-06  2023-07-07  ...  2023-07-18 │ 63000/J/lifemiles - 87000/J/emirates - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DUB-DXB-ORD │ 2023-07-04                                          │ 60000/J/aeroplan - 87000/J/emirates - 138000/J/emirates   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ARN-DXB-ORD │ 2023-07-14                                          │ 63000/J/lifemiles - 61000/J/aeroplan - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-FRA-DXB-ORD │ 2023-07-03  2023-07-04  2023-07-08                  │ 63000/J/lifemiles - 42000/J/lifemiles - 138000/J/emirates │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-GRU-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 80000/J/aeroplan - 50000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-BRU-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 45000/J/aeroplan - 70000/J/aeroplan    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-ZRH-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 45000/J/aeroplan - 63000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-VIE-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 45000/J/aeroplan - 63000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DOH-VIE-ORD │ 2023-06-08                                          │ 70000/J/american - 42500/J/american - 63000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DOH-WAW-ORD │ 2023-06-08  2023-06-14                              │ 70000/J/american - 42500/J/american - 63000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DOH-ADD-ORD │ 2023-06-08  2023-06-14                              │ 70000/J/american - 20000/J/aeroplan - 78000/J/lifemiles   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DOH-DXB-ORD │ 2023-06-08  2023-06-14                              │ 70000/J/american - 30000/F/american - 138000/J/emirates   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DEL-ADD-ORD │ 2023-06-05                                          │ 88000/F/united - 69000/J/united - 78000/J/lifemiles       │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-MAD-ORD │ 2023-06-08  2023-06-13  2023-06-15                  │ 163500/F/emirates - 87000/J/emirates - 57500/J/american   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-FRA-DEL-ORD │ 2023-07-03  2023-07-04  2023-07-08                  │ 63000/J/lifemiles - 45000/J/lifemiles - 88000/F/united    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-VIE-DEL-ORD │ 2023-07-03  2023-07-05                              │ 63000/J/lifemiles - 45000/J/lifemiles - 88000/F/united    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DEL-WAW-ORD │ 2023-06-05                                          │ 88000/F/united - 45000/J/lifemiles - 63000/J/lifemiles    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DEL-VIE-ORD │ 2023-06-05                                          │ 88000/F/united - 45000/J/lifemiles - 63000/J/lifemiles    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-GRU-DXB-ORD │ 2023-06-04  2023-06-05  2023-06-08  ...  2023-06-27 │ 50000/J/lifemiles - 180000/F/emirates - 138000/J/emirates │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-FCO-DXB-ORD │ 2023-06-04                                          │ 78000/J/american - 102000/F/emirates - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-DXB-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 85500/F/emirates - 138000/J/emirates   │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-BRU-DXB-ORD │ 2023-07-09  2023-07-14  2023-07-16  2023-07-17      │ 63000/J/lifemiles - 102000/F/emirates - 138000/J/emirates │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-IST-DXB-ORD │ 2023-07-17                                          │ 63000/J/lifemiles - 85500/F/emirates - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-VIE-ORD │ 2023-06-04  2023-06-06  2023-06-08                  │ 163500/F/emirates - 45000/J/aeroplan - 63000/J/lifemiles  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-ADD-LHR-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 45000/J/aeroplan - 85000/F/american    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-DEL-ORD │ 2023-06-13  2023-06-15  2023-06-24  ...  2023-07-12 │ 163500/F/emirates - 54000/J/emirates - 88000/F/united     │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-LHR-DXB-ORD │ 2023-06-12  2023-07-02  2023-07-03  ...  2023-07-19 │ 85000/F/alaska - 102000/F/emirates - 138000/J/emirates    │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-LHR-DEL-ORD │ 2023-06-12  2023-07-02  2023-07-03  ...  2023-07-11 │ 85000/F/american - 42500/J/american - 88000/F/united      │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-BRU-ORD │ 2023-06-04  2023-06-06                              │ 163500/F/emirates - 102000/F/emirates - 70000/J/aeroplan  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-ADD-ORD │ 2023-06-04  2023-06-06  2023-06-08  ...  2023-07-07 │ 163500/F/emirates - 85500/F/emirates - 78000/J/lifemiles  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-MUC-ORD │ 2023-06-04  2023-06-06                              │ 163500/F/emirates - 102000/F/emirates - 63000/J/lifemiles │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-ZRH-ORD │ 2023-06-04  2023-06-06                              │ 163500/F/emirates - 102000/F/emirates - 63000/J/lifemiles │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-WAW-ORD │ 2023-06-04  2023-06-06  2023-06-08  ...  2023-06-28 │ 163500/F/emirates - 102000/F/emirates - 63000/J/lifemiles │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DEL-DXB-ORD │ 2023-06-05  2023-07-19                              │ 130000/F/aeroplan - 63000/F/emirates - 138000/J/emirates  │
├─────────────────┼─────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ORD-DXB-LHR-ORD │ 2023-06-04  2023-06-06  2023-06-08  ...  2023-07-09 │ 163500/F/emirates - 102000/F/emirates - 85000/F/alaska    │
└─────────────────┴─────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
Num results:  7416

```

After looking through the options, I noticed a particular trip that looks interesting for me:

```
ORD-ADD-ZRH-ORD │ 2023-06-06                                          │ 90000/J/aeroplan - 45000/J/aeroplan - 63000/J/lifemiles
```

To get more information about this itinerary, I perform a trip search. Note that JSeats=0 doesn't mean that there are no seats, just that there is no data around how many seats are available (but it's >=1).

```
$npm run tripsearch -- --from ord --to add zrh --class J -d

┌────────────┬──────┬─────┬──────────┬────────┬───────┬─────────┐
│ Date       │ From │ To  │ Source   │ JSeats │ JCost │ JDirect │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-06 │ ORD  │ ADD │ aeroplan │ 0      │ 90000 │ true    │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-14 │ ADD  │ ZRH │ united   │ 2      │ 58500 │ true    │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-21 │ ZRH  │ ORD │ aeroplan │ 0      │ 70000 │ true    │
└────────────┴──────┴─────┴──────────┴────────┴───────┴─────────┘
┌────────────┬──────┬─────┬───────────┬────────┬───────┬─────────┐
│ Date       │ From │ To  │ Source    │ JSeats │ JCost │ JDirect │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-06 │ ORD  │ ADD │ aeroplan  │ 0      │ 90000 │ true    │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-14 │ ADD  │ ZRH │ united    │ 2      │ 58500 │ true    │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-21 │ ZRH  │ ORD │ lifemiles │ 3      │ 63000 │ true    │
└────────────┴──────┴─────┴───────────┴────────┴───────┴─────────┘
┌────────────┬──────┬─────┬──────────┬────────┬───────┬─────────┐
│ Date       │ From │ To  │ Source   │ JSeats │ JCost │ JDirect │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-06 │ ORD  │ ADD │ aeroplan │ 0      │ 90000 │ true    │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-14 │ ADD  │ ZRH │ aeroplan │ 0      │ 45000 │ true    │
├────────────┼──────┼─────┼──────────┼────────┼───────┼─────────┤
│ 2023-06-21 │ ZRH  │ ORD │ aeroplan │ 0      │ 70000 │ true    │
└────────────┴──────┴─────┴──────────┴────────┴───────┴─────────┘
┌────────────┬──────┬─────┬───────────┬────────┬───────┬─────────┐
│ Date       │ From │ To  │ Source    │ JSeats │ JCost │ JDirect │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-06 │ ORD  │ ADD │ aeroplan  │ 0      │ 90000 │ true    │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-14 │ ADD  │ ZRH │ aeroplan  │ 0      │ 45000 │ true    │
├────────────┼──────┼─────┼───────────┼────────┼───────┼─────────┤
│ 2023-06-21 │ ZRH  │ ORD │ lifemiles │ 3      │ 63000 │ true    │
└────────────┴──────┴─────┴───────────┴────────┴───────┴─────────┘
Num results: 4
```

Note that the "best" flights are attempted to be listed last.

Once you have a trip plan that you're interested in, it's best to check seats.aero to ensure that the data is fresh. This script only updates data from seats.aero once per day. Visit https://seats.aero/search for each leg of the journey and make sure the flights are all available and look correct.

## Docs

### Explore

Searches for any itineraries available from origin airports. This is useful if both dates and destinations are flexible. Note that using n > 2 may take a long time as this just does a simple brute force algorithm.

`npm run explore -f {airport_codes}`

<b>Required</b>
* --from {value...} (-f): List of airports to search from. Optionally add weights to each airport with a colon(:), e.g. `--from sea:1 sfo:2`. Weight defaults to 1 if omitted. Weights are described more below.

<b> Optional </b>
* --num-destinations {value} (-n): Number of destinations to visit on the trip. Defaults to 1.
* --exclude-airports {value...} (-e): Exclude airports from search.
* --exclude-regions {value...}: Exclude regions from search.
* --exclude-sources {value...}: Exclude sources (e.g. alaska, lifemiles) from search.
* --direct (-d): Only search for direct flights.
* --folder {value}: Folder to store flight data.
* --class {value...} (-c): List of classes to search. Defaults to all of Y, W, J, and F.

<b>Full Example</b>

`explore -f sea sfo:2 lax:2 -n 2 -e doh lhr --exclude-regions "North America" --exclude-sources alaska united -d --folder /home/my-path/seatsaerodata -c J F`

<b> Weights </b>

Routes that are the same without taking the *from* destinations into account will prioritize using airports with a lower priority.

For example, take into account the full example above with the *-f* field containing `-f sea sfo:2 lax:2`. In this case, if there is a route for both:

`SEA->LHR->SEA`

and 

`SFO->LHR->SFO`

then the results will *only* show the SEA->LHR->SEA route since the airports are listed at a lower priority (sea has a default priority of 1 and sfo has a priority of 2). This does not take into account trip price, so SFO->LHR->SFO would still be removed even if it is a cheaper price. If priorities are the same between routes, all of them will be returned. This means that omitting priority for all airports will return every possible result.

### Trip Search

Finds an itinerary for flights originating and ending in one of the listed airports while visiting the "to" airports. Using multiple "from" airports could require repositioning flights.

`npm run tripsearch -f {airport_codes} -t {airport_codes}`

<b>Required</b>
* --from {value...} (-f): List of airports to search from
* --to {value...} (-t): List of airports to search to. Optionally specify the number of days to stay at each airport with a colon and then time range (e.g. '-to ZRH:5-10' to stay in ZRH between 5 and 10 days)

<b>Optional</b>
* --non-point-segments {value...}: Segments that the algorithm will allow for \"free.\" Useful for short haul flights or allowing the algorithm to use multiple airports in a single city (e.g. HND-NRT or MEL-SYD).
* --start-date {value} (-s): Date to start search
* --end-data {value} (-e): Date to end search *for the first flight*. The entire trip may take go past this date.
* --direct (-d): Only search for direct flights.
* --folder {value}: Folder to store flight data.
* --class {value...} (-c): List of classes to search. Defaults to all of Y, W, J, and F.

<b> Full Example </b>

`tripsearch -f sea sfo lax -t nan akl --non-point-segments nan-akl -s 2023-07-01 -e 2023-08-01 -d --folder /home/my-path/seatsaerodata -c J F`

### Route Search

Finds flights from airport(s) to other airport(s). This is similar to the "search" functionality on seats.aero website. It's likely easier to use the website for this rather than this tool, but it's here to avoid context switching, and it can search more than 2 weeks at a time.

`npm run routesearch -f {airport_codes} -t {airport_codes}`

<b>Required</b>
* --from {value...} (-f): List of airports to search from
* --to {value...} (-t): List of airports to search to

<b>Optional</b>
* --start-date {value} (-s): Date to start search
* --end-data {value} (-e): Date to end search
* --direct (-d): Only search for direct flights
* --folder {value}: Folder to store flight data
* --class {value...} (-c): List of classes to search. Defaults to all of Y, W, J, and F

<b> Full Example </b>

`routesearch -f sea sfo lax -t hnd nrt sin -s 2023-07-01 -e 2023-08-01 -d --folder /home/my-path/seatsaerodata -c J F`