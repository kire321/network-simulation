# network-simulation
We simulate a network of database servers, who would like to store some
information but are plagued by random failures.

## Build and run
You need to have the typescript compiler installed already.
`tsc *.ts --module commonjs && node main.js`

##Development plan
- Milestone 1: client and server, client sends data to server, server stores data, client retrieves data 
- Milestone 2: introduce latency, dropped packets, and node failures
- Milestone 3/Finished: The DB uses multiple servers and is tolerates
  the faults
