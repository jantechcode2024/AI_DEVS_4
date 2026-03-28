1. Do Skolwin 
2. Mapy 10x10
3. Kazdy ruch spala paliwo (chyba ze pieszo)
4. Kazdy ruch spala zarcie 
5. Mamy 10 paliwa i 10 zarcia 

# Odnalezienie narzędzia + akcja: 
Q1: Find the map of Skolwin terrain for me. --> call(find_external_tools => return url + query)
Q2: What kind of vehicles are possible. Analyze all of them and remember the data. --> call(find_external_tools  => vehicles API) --> Analyze all types of vehicles --> recall 
Q3: Now bring the map of Skolwin you already fetched and plan for me how to get from S to G symbols. 


My tools: 
find_external_tool: 

call_external_tool