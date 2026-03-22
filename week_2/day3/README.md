# Input 
failure.log 


# Steps 
1. Load file to memory by chunking (not whole file)
2. Full text search line by line with categories [CRIT] [ERRO]
3. Return only this lines.
4. Pass this line to AGENT. Agent should :
    a) Compress  lines (chunking) - avoid duplicated rows 
    b) Return data in format [YYYY-MM-DD] [CATEGORY] logMessage
    c) Send it to hub as verification 

5. Hub sends:
    a) {FLG: ...} - we end process and return the flag
    b) No flag - read the message from verification API and retry process from point 4.