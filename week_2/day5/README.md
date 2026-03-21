

# General info 
DOCUMENTATION: https://hub.ag3nts.org/dane/drone.html
MAPA: https://hub.ag3nts.org/data/322220ae-708d-4d8c-bf86-db9685c4a40f/drone.png.



# Agents: 
1. Map analyzer - should analyze and find coordinates for drone --> 
2. Drone - based on provided documentation via API, should use coordinates from Map analyzer. WARN: documentation is full of traps and overrided methods


# Answer 
{
  "apikey": "tutaj-twój-klucz",
  "task": "drone",
  "answer": {
    "instructions": ["instrukcja1", "instrukcja2", "..."]
  }
}

# Flow: 
1. Map analyzer agent analyzing picture and tries to find bam
2. Map analyzer returns bam coordinates in format "1x3" meaning column 1, row 3.
3. Pass the data within a query to Drone agent query: ... {x = 1, y = 3, destinationObjectId: "PWR6132PL"}.
4. Drone agent fetches the documentation of drone.
5. D_agent preparing set of actions separated by "," f.e. ["setDestinationObject(BLD1234PL)", "set(x,y)"]
6. Send it to hub: 

{
  "apikey": "tutaj-twój-klucz",
  "task": "drone",
  "answer": {
    "instructions": ["instrukcja1", "instrukcja2", "..."]
  }
}.

If flag is found then good. If not, read the answer from the hub 

# Tools for Drone Agent 
- fetch_documentation - always first step 
- prepare_drone_instructions 
- verify 