# Deploy SOSM

This guide explains how to **deploy an empty SOSM instance** to a prepared development environment. If the **development environment** is not yet configured, see [`setupEnvironment.md`](./setupEnvironment.md). Once SOSM is deployed, it can be populated with [test data](./deployTestData.md), if required.

## Hybrid Dev Environment

Run `docker compose up db -d` to build the container, setup the database volume and run the container.
Verify operation of the container with `docker ps`.
