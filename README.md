# network-simulation
We simulate a network of database servers, who would like to store some
information but are plagued by random failures.

The evolution of the plan (in this file) is at least as interesting as
the code itself. Some noteworthy things about the code:
- heavily async JS is readable because of futures
- the code has at least one of everything: a class, a unit test, etc

## Build and run
You need to have the typescript compiler and npm installed
already. Clone this repo and `cd` to it.
Once, to set things up: `npm install q`
Every time you make a code change: `tsc *.ts --module commonjs && node main.js`

##Development plan
- Milestone 1: client and server, client sends data to server, server stores data, client retrieves data -- DONE
- Milestone 2 -- MVP version of failure: dropped packets, and simple version of node failures, the integration test is statistical and handles flakiness well
- Milestone 3: The DB uses multiple servers and is tolerates
  the faults
- Milestone 4: Implement time. Introduce latency, and more realistic
  node failure.

main.js will be split to multiple files if it grows beyond 500 lines
