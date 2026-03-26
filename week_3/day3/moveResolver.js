
const GOAL_ROW = 5;
const GOAL_COLUMN = 7;
const FINAL_POSITION = 6;


export async function nextMove(data) {
    if (!data.board || (data.player.col === GOAL_COLUMN && data.player.col === GOAL_ROW)) {
        console.log('FLG is ', data);
        return data;
    }

    const playerCol = data.player.col;
    console.log('Player col is ', playerCol);
    console.log('Checking next move based on blocks...')

    const block = data.blocks.find(b => b.col === playerCol + 1);
    console.log("Block found...", block);

    //safe position
    if (playerCol === FINAL_POSITION) return "right";
    if (block.bottom_row === 5 || (block.bottom_row === 4 && block.direction === "down"))
        return "wait";

    return "right";

}