RULES: 
We have player position 
col: 1 
row: 5 

Check if there is a block in next col 

- get player col 
- add one to this col 
- find block in pCol + 1 
- Check if: 
    * bottom_row == 5 --> wait 
    * bottom_row == 4 && direction === down --> wait 
    * else move "right"