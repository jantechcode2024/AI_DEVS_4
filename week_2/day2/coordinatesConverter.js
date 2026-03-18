
export async function mapConnections(data) {
    const keywords = ["top", "right", "bottom", "left"];
  
    return data.reduce((result, item) => {
      const desc = item.description.toLowerCase();
  
      result[item.cell] = keywords.map(word => desc.includes(word) ? 1 : 0);
  
      return result;
    }, {});
  }