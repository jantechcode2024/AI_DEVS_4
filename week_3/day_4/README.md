

# Baza wiedzy 
- cities.csv - miasta 
- connections.csv - połączenie miasto + item 
- items.csv - dostępne itemy i ich kody 


# Flow 
1. Agent pyta, potrzebuje tranzystor NPN BC547 
2. LLM: Konwersja z języka naturalnego do nazw/ nazwy z pliku i zwrócenie kodów 
3. PROGRAMMING_INTERFACE:  open connections.csv and find cities bases on item code 
4. PROGRAMMING_INTERFACE: open cities.csv and map codes ==> cities
4. Return: {
    "output": "Warszawa, Wrocław..."
}

# Tools 
provide_cities  