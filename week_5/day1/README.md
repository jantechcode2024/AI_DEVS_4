## Flow 
1. odbierasz materiał
2. rozpoznajesz, czy to tekst, szum czy binarka
3. 
Tekst: zwracam tekst do modelu, który będzie odpowiedzialny za jego analizę i odfiltrowanie szumu, zapisze do pliku md tylko niezbędne informacje. 

Binarka: audio, img, json , csv, text 
 
4. Kazda wartosciowa informacje zapisuje do pliku markdown


5. Weryfikacja -> czytam markdown za pomoca modelu i ustalam odp w formacie: 
 {
  "apikey": "tutaj-twoj-klucz",
  "task": "radiomonitoring",
  "answer": {
    "action": "transmit",
    "cityName": "NazwaMiasta",
    "cityArea": "12.34",
    "warehousesCount": 321,
    "phoneNumber": "123456789"
  }
}


## Tools 
read_file 
list_files
write_file 
verify 
listen 
