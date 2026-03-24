# Main goal 
Find files with incorrect data

# Incorrect data meaning 
- Dane pomiarowe poza normami 
- Operator twierdzi, ze wszystko jest OK, ale dane sa niepoprawne 
- Operator twierdzi, ze znalazl bledy, ale dane sa OK 
- Czujnik zwraca dane ktorych nie powinien zwracac 

# Idea 
* Classic programming - dane pomiarowe poza normami, czujniki zlego typu. 
* Model LLM           - analyze operator 

# Flow 
1. Programistyczne przejście plik po pliku i sprawdzenie wartości / typów czujnika, dodanie do listy wynikowej nazwy, ta lista będzie przekazana jako ignore do LLM. 

2. Przekazanie pozostałych plików do analizy do LLM - najlepiej wysylać pliki w paczkach, jako output tylko lista ["0020"...]