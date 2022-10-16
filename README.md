# system-of-systems-modeller
System-of-systems-modeller (SOSM) is a NodeJS-based web app supported by an SQL database (MySQL) which allows a user to model nodes, their interfaces and the ways in which they connect (links). SOSM uses a number of client-side JS libraries which attempts to provide a clean UI, whilst also providing a clear graphical representation of the system, or the particular view of the system that the user is currently interested in.

## SOSM Terms
SOSM defines the following terms:
- System. The systems which make up the greater system. Systems form the primary nodes of the standard graph.
- Subsystems. Systems might be fitted with a selection of specific subsystems.
- Interface. The means by which a system connects to other systems.
- Link. The link established between two or more interfaces. This was formally referred to as a network, and some references to network may still exist.
- Technology. The technology implemented by an interface as well as the technology that links use to communicate.

## SOSM Dependencies
SOSM requires a number of external dependencies to function. Client side external dependencies can be found within /www/index.html. Client side external dependencies include:
- Bootstrap JS (4.3.1)
- Bootstrap CSS (4.6.1)
- Cytoscape JS (3.21.0)
- JQuery (3.5.1)
- ChartJS (3.7.1)
- Popper (1.14.7)

Server-side dependencies include
- MySQL (8.0.27)
- NodeJS (12.21.0)
- NPM. With packages:
-- MySQL2

## Initial Deployment
When deploying the database, the user should write /sql/deploySchema.sql to the database, followed by /sql/schemaUpdates.sql. This will get the database schema up to what the remainder of the code requires. When pulling an update, the user should check the existing version of SOSM (as detailed in /www/package.json) with the latest, and apply only the updates necessary from /sql/schemaUpdates.sql.

Some instances of SOSM may required tailored data, which is captured in a privateConstants.js file. If you do not have this file, uncomment the relevant object definitions in constants.js (i.e. severityLabels, categories)

