//Utils.mjs






class Utils {

  static arrayContainsJsonValue(jsonArray, key, searchValue){
    return jsonArray.some(function(jsonObject) {
      return jsonObject[key] === searchValue;
    });
  }

  static isValidValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (typeof value === "string" && !/^[a-zA-Z0-9\s.:\/]+$/.test(value)) return false;
    return true;
  }

  static async validateArgs(args, validKeys) {
    const errors = [];
  
    for (const key of validKeys) {
      if (!args.hasOwnProperty(key)) {
        errors.push(`Missing ${key}`);
      } else {
        const value = args[key];
        if (typeof value === "string" || Array.isArray(value) || typeof value === "number" || typeof value === "boolean") {
          if (!this.isValidValue(value)) errors.push(`Invalid ${key}`)
        } else errors.push(`Invalid ${key} data type`)
      }
    }
    if (errors.length !== 0) return errors.join(', ')
    return true;
  }

  
}

export default Utils